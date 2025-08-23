import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
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

    const url = 'https://api.deepgram.com/v1/speak?model=aura-2-thalia-en';
    const dgRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

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
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}