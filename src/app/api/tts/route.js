import { NextResponse } from 'next/server';

// Enhanced in-memory queue and rate limiter
const requestQueue = [];
const activeRequests = new Set();
const MAX_CONCURRENT_REQUESTS = 5; // Reduced to be more conservative
const MAX_QUEUE_SIZE = 50; // Reduced queue size
const REQUEST_TIMEOUT = 20000; // 20 seconds

// Enhanced rate limiting per IP
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15; // Increased slightly
const BURST_LIMIT = 5; // Allow short bursts
const BURST_WINDOW = 10000; // 10 seconds

// Request deduplication cache
const requestCache = new Map();
const CACHE_TTL = 300000; // 5 minutes

function getRateLimitKey(req) {
  return req.headers.get('x-forwarded-for') || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

function isRateLimited(key) {
  const now = Date.now();
  const requests = rateLimitMap.get(key) || [];
  
  // Remove old requests outside the window
  const validRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
  const recentRequests = requests.filter(time => now - time < BURST_WINDOW);
  
  // Check burst limit (short term)
  if (recentRequests.length >= BURST_LIMIT) {
    return { limited: true, reason: 'burst', retryAfter: Math.ceil((BURST_WINDOW - (now - recentRequests[0])) / 1000) };
  }
  
  // Check overall rate limit (longer term)
  if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return { limited: true, reason: 'rate', retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - validRequests[0])) / 1000) };
  }
  
  validRequests.push(now);
  rateLimitMap.set(key, validRequests);
  return { limited: false };
}

function getCacheKey(text) {
  // Create a simple hash for caching
  return text.toLowerCase().trim();
}

function cleanupCache() {
  const now = Date.now();
  for (const [key, { timestamp }] of requestCache.entries()) {
    if (now - timestamp > CACHE_TTL) {
      requestCache.delete(key);
    }
  }
}

async function processRequest(requestData) {
  const { text, apiKey } = requestData;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const url = 'https://api.deepgram.com/v1/speak?model=aura-2-thalia-en';
    
    // Add some delay between requests to Deepgram to be more respectful
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const dgRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // Handle Deepgram rate limiting specifically
    if (dgRes.status === 429) {
      const retryAfter = dgRes.headers.get('retry-after') || '5';
      throw new Error(`UPSTREAM_RATE_LIMIT:${retryAfter}`);
    }
    
    return dgRes;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function executeQueue() {
  while (requestQueue.length > 0 && activeRequests.size < MAX_CONCURRENT_REQUESTS) {
    const { requestData, resolve, reject } = requestQueue.shift();
    
    const requestId = Date.now() + Math.random();
    activeRequests.add(requestId);
    
    processRequest(requestData)
      .then(resolve)
      .catch(reject)
      .finally(() => {
        activeRequests.delete(requestId);
        executeQueue(); // Process next request
      });
  }
}

function queueRequest(requestData) {
  return new Promise((resolve, reject) => {
    if (requestQueue.length >= MAX_QUEUE_SIZE) {
      reject(new Error('Queue is full'));
      return;
    }
    
    requestQueue.push({ requestData, resolve, reject });
    executeQueue();
  });
}

export async function POST(req) {
  try {
    // Clean up old cache entries periodically
    if (Math.random() < 0.1) cleanupCache();

    // Rate limiting check
    const clientKey = getRateLimitKey(req);
    const rateLimitResult = isRateLimited(clientKey);
    
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { 
          error: `Rate limit exceeded (${rateLimitResult.reason}). Please try again later.`,
          retryAfter: rateLimitResult.retryAfter
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter.toString(),
            'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + rateLimitResult.retryAfter * 1000).toISOString()
          }
        }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing DEEPGRAM_API_KEY' }, { status: 500 });
    }

    // Parse body (supports JSON; falls back gracefully)
    let text;
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => null);
      text = body?.text;
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await req.formData().catch(() => null);
      text = form?.get('text');
    } else {
      const body = await req.json().catch(() => null);
      text = body?.text;
    }

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Validate text length to prevent abuse
    if (text.length > 1000) { // Reduced from 5000 to be more conservative
      return NextResponse.json({ error: 'Text too long (max 1000 characters)' }, { status: 400 });
    }

    // Check cache for duplicate requests
    const cacheKey = getCacheKey(text);
    if (requestCache.has(cacheKey)) {
      const cached = requestCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('📦 Serving cached TTS result');
        return new NextResponse(cached.data, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=300',
            'X-Cache': 'HIT'
          },
        });
      } else {
        requestCache.delete(cacheKey);
      }
    }

    // Queue the request if we're at capacity
    let dgRes;
    try {
      dgRes = await queueRequest({ text, apiKey });
    } catch (queueError) {
      if (queueError.message === 'Queue is full') {
        return NextResponse.json(
          { error: 'Server is busy. Please try again in a few seconds.' }, 
          { status: 503, headers: { 'Retry-After': '3' } }
        );
      }
      
      // Handle upstream rate limiting
      if (queueError.message.startsWith('UPSTREAM_RATE_LIMIT:')) {
        const retryAfter = queueError.message.split(':')[1] || '5';
        return NextResponse.json(
          { error: 'Voice service is temporarily busy. Please try again.', retryAfter: parseInt(retryAfter) },
          { status: 429, headers: { 'Retry-After': retryAfter } }
        );
      }
      
      throw queueError;
    }

    if (!dgRes.ok) {
      const error = await dgRes.text().catch(() => 'Upstream error');
      return NextResponse.json({ 
        error: `Voice synthesis failed: ${error}` 
      }, { status: dgRes.status });
    }

    // Cache successful responses
    const audioData = await dgRes.arrayBuffer();
    requestCache.set(cacheKey, {
      data: audioData,
      timestamp: Date.now()
    });

    // Stream audio back to client
    return new NextResponse(audioData, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=300',
        'X-Queue-Position': requestQueue.length.toString(),
        'X-Active-Requests': activeRequests.size.toString(),
        'X-Cache': 'MISS'
      },
    });
  } catch (e) {
    console.error('TTS API Error:', e);
    
    if (e.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
    }
    
    return NextResponse.json({ 
      error: 'Voice synthesis service temporarily unavailable. Please try again.' 
    }, { status: 500 });
  }
}