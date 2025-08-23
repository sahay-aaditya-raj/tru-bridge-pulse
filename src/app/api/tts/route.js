import { NextResponse } from 'next/server';

// Simple in-memory queue and rate limiter
const requestQueue = [];
const activeRequests = new Set();
const MAX_CONCURRENT_REQUESTS = 100;
const MAX_QUEUE_SIZE = 200;
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Rate limiting per IP
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

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
  
  if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  validRequests.push(now);
  rateLimitMap.set(key, validRequests);
  return false;
}

async function processRequest(requestData) {
  const { text, apiKey } = requestData;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const url = 'https://api.deepgram.com/v1/speak?model=aura-2-thalia-en';
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
    // Rate limiting check
    const clientKey = getRateLimitKey(req);
    if (isRateLimited(clientKey)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' }, 
        { status: 429 }
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
    if (text.length > 5000) {
      return NextResponse.json({ error: 'Text too long (max 5000 characters)' }, { status: 400 });
    }

    // Queue the request if we're at capacity
    let dgRes;
    try {
      dgRes = await queueRequest({ text, apiKey });
    } catch (queueError) {
      if (queueError.message === 'Queue is full') {
        return NextResponse.json(
          { error: 'Server is busy. Please try again later.' }, 
          { status: 503 }
        );
      }
      throw queueError;
    }

    if (!dgRes.ok) {
      const error = await dgRes.text().catch(() => 'Upstream error');
      return NextResponse.json({ error }, { status: dgRes.status });
    }

    // Stream audio back to client
    return new NextResponse(dgRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
        'X-Queue-Position': requestQueue.length.toString(),
        'X-Active-Requests': activeRequests.size.toString(),
      },
    });
  } catch (e) {
    console.error('TTS API Error:', e);
    
    if (e.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}