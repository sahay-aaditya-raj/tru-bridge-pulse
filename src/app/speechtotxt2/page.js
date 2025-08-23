'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

export default function LiveTranscription() {
  const [transcript, setTranscript] = useState('');
  const [currentUtterance, setCurrentUtterance] = useState('');
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [silence, setSilence] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);

  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const connectionRef = useRef(null);
  const streamRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const currentUtteranceRef = useRef('');
  const isClosingRef = useRef(false);
  const convoEndRef = useRef(null);
  const shouldKeepMicActiveRef = useRef(false); // NEW: Track if mic should stay active

  // TTS playback refs
  const audioRef = useRef(null);
  const lastUrlRef = useRef(null);
  const ttsQueueRef = useRef([]);
  const speakingRef = useRef(false);
  const ttsAbortControllersRef = useRef(new Set());

  const TTS_PLAYBACK_RATE = 1.15;

  // Mute/unmute mic while bot speaks
  const beginBotSpeaking = () => {
    console.log('🤖 Bot speaking: starting playback. Disabling mic.');
    setIsBotSpeaking(true);
    try {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    } catch {}
    setSilence(true);

    // Pause recorder (do not stop) and disable tracks (do not stop)
    try {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state === 'recording' && typeof mr.pause === 'function') {
        mr.pause();
        console.log('🎙️ Mic paused (MediaRecorder paused).');
      }
    } catch (e) {
      console.warn('Failed to pause MediaRecorder:', e);
    }
    try {
      const tracks = streamRef.current?.getTracks?.() || [];
      tracks.forEach((t) => (t.enabled = false));
      if (tracks.length) console.log('🎙️ Mic disabled (tracks disabled).');
    } catch (e) {
      console.warn('Failed to disable mic tracks:', e);
    }
  };

  // Enable mic only if TTS is idle (prevents capturing bot greeting)
  const enableMicIfSafe = () => {
    if (speakingRef.current || ttsQueueRef.current.length > 0) {
      console.log('🔒 Mic stays disabled (bot speaking or TTS queued).');
      return;
    }
    try {
      const tracks = streamRef.current?.getTracks?.() || [];
      tracks.forEach((t) => (t.enabled = true));
      if (tracks.length) console.log('🎙️ Mic enabled (tracks enabled).');
    } catch (e) {
      console.warn('Failed to enable mic tracks:', e);
    }
    try {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state === 'paused' && typeof mr.resume === 'function') {
        mr.resume();
        console.log('🎙️ Mic resumed (MediaRecorder resumed).');
      }
    } catch (e) {
      console.warn('Failed to resume MediaRecorder:', e);
    }
    setSilence(false);
  };

  const endBotSpeaking = () => {
    setIsBotSpeaking(false);
    console.log('✅ Bot speech completed.');
    // Re-enable mic if no more TTS is pending
    enableMicIfSafe();
  };

  // TTS helpers
  const stopAudio = () => {
    try {
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.src = '';
      }
    } catch {}
    // Abort any in-flight TTS requests
    try {
      for (const c of ttsAbortControllersRef.current) c.abort();
      ttsAbortControllersRef.current.clear();
    } catch {}
    if (lastUrlRef.current) {
      URL.revokeObjectURL(lastUrlRef.current);
      lastUrlRef.current = null;
    }
    audioRef.current = null;
    ttsQueueRef.current.length = 0;
    speakingRef.current = false;
    setIsBotSpeaking(false);
  };

  // Prefetch TTS and return a blob URL (starts immediately, plays later)
  const synthesizeToUrl = async (text) => {
    const ctrl = new AbortController();
    ttsAbortControllersRef.current.add(ctrl);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error('TTS request failed');
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } finally {
      ttsAbortControllersRef.current.delete(ctrl);
    }
  };

  const playUrl = async (url) => {
    // Revoke previous URL (now finished) before assigning new
    if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current);
    lastUrlRef.current = url;

    const audio = new Audio(url);
    audio.playbackRate = TTS_PLAYBACK_RATE;
    audioRef.current = audio;

    await new Promise((resolve, reject) => {
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play().catch(reject);
    });
  };

  const processQueue = async () => {
    if (speakingRef.current) return;
    if (ttsQueueRef.current.length === 0) return;

    speakingRef.current = true;
    console.log('🤖 Bot speaking: queue playback started.');
    beginBotSpeaking();
    try {
      // Play all queued items back-to-back with mic muted
      while (ttsQueueRef.current.length) {
        const next = ttsQueueRef.current.shift();
        try {
          const url = await next.urlPromise;
          await playUrl(url);
        } catch (e) {
          console.warn('TTS playback failed:', e);
        }
      }
    } finally {
      speakingRef.current = false;
      endBotSpeaking();
      // If something queued while we were playing, process again
      if (ttsQueueRef.current.length) processQueue();
    }
  };

  const enqueueTTS = (text) => {
    const t = String(text || '').trim();
    if (!t) return;
    // Kick off fetch immediately; playback will await the promise
    const urlPromise = synthesizeToUrl(t);
    ttsQueueRef.current.push({ text: t, urlPromise });
    if (!speakingRef.current) processQueue();
  };

  // Split long text into short speakable chunks (sentences, then max length)
  const splitIntoTTSChunks = (text, maxLen = 240) => {
    const s = String(text || '').trim();
    if (!s) return [];
    let sentences = [];

    // Prefer sentence segmentation if available
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      try {
        const seg = new Intl.Segmenter('en', { granularity: 'sentence' });
        for (const { segment } of seg.segment(s)) {
          const t = segment.trim();
          if (t) sentences.push(t);
        }
      } catch {}
    }
    if (sentences.length === 0) {
      sentences = s.split(/(?<=[.!?])\s+/).map(t => t.trim()).filter(Boolean);
    }

    const chunks = [];
    for (const sent of sentences) {
      if (sent.length <= maxLen) {
        chunks.push(sent);
        continue;
      }
      // Further split long sentences by comma/space
      let rest = sent;
      while (rest.length > maxLen) {
        let cut = rest.lastIndexOf(',', maxLen);
        if (cut < 0) cut = rest.lastIndexOf(' ', maxLen);
        if (cut < 0) cut = maxLen;
        chunks.push(rest.slice(0, cut).trim());
        rest = rest.slice(cut).trim();
      }
      if (rest) chunks.push(rest);
    }
    return chunks;
  };

  const enqueueTTSChunks = (text) => {
    const chunks = splitIntoTTSChunks(text);
    for (const chunk of chunks) enqueueTTS(chunk);
  };

  // Helper: stop mic, recorder, and silence timer - but only if WebSocket is actually closed
  const shutdownMic = () => {
    // Only shutdown if WebSocket is closed or we're explicitly stopping
    if (!shouldKeepMicActiveRef.current) {
      console.log('🔇 Shutting down mic (WebSocket closed or explicit stop)');
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch {}
      mediaRecorderRef.current = null;

      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach((t) => t.stop());
        } catch {}
        streamRef.current = null;
      }

      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }

      setCurrentUtterance('');
      setSilence(false);
      setIsTranscribing(false);
    } else {
      console.log('🎙️ Keeping mic active (WebSocket still connected)');
    }
  };

  // Auto-restart Deepgram connection if it closes but WebSocket is still open
  const restartDeepgramIfNeeded = async () => {
    if (shouldKeepMicActiveRef.current && 
        socketRef.current && 
        socketRef.current.readyState === WebSocket.OPEN &&
        !isClosingRef.current) {
      console.log('🔄 Restarting Deepgram connection (WebSocket still active)');
      setTimeout(() => {
        if (shouldKeepMicActiveRef.current) {
          startDeepgramConnection();
        }
      }, 1000); // Brief delay before reconnecting
    }
  };

  // ------------------ WebSocket helpers ------------------
  const ensureSocketConnected = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return;

    try {
      const socket = new WebSocket('ws://10.50.63.14:5001');
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('✅ WebSocket connected');
        shouldKeepMicActiveRef.current = true; // Enable mic protection
      };

      socket.onmessage = (event) => {
        console.log('📩 Message from server:', event.data);
        const msg = String(event.data);
        setConversation((prev) => [...prev, { role: 'bot', text: msg }]);
        enqueueTTSChunks(msg);
      };

      socket.onclose = () => {
        console.log('❌ WebSocket closed');
        shouldKeepMicActiveRef.current = false; // Disable mic protection
        socketRef.current = null;

        // Now it's safe to shutdown mic since WebSocket is closed
        if (!isClosingRef.current) {
          shutdownMic();
          try {
            connectionRef.current?.requestClose?.();
          } catch {}
        }
      };

      socket.onerror = (err) => {
        console.error('⚠️ WebSocket error:', err);
      };
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setError('WebSocket connection failed');
      throw err;
    }
  };

  const closeSocket = () => {
    shouldKeepMicActiveRef.current = false; // Disable mic protection
    const sock = socketRef.current;
    if (sock) {
      try {
        sock.close();
      } catch {}
      socketRef.current = null;
    }
  };

  const sendToServer = (msg) => {
    const trimmed = msg.trim();
    if (!trimmed) return;
    const sock = socketRef.current;
    if (sock && sock.readyState === WebSocket.OPEN) {
      sock.send(trimmed);
      console.log('📤 Sent to server:', trimmed);
    } else {
      console.warn('⚠️ Socket not open; could not send:', trimmed);
    }
  };

  // ------------------ Deepgram Transcription ------------------
  const startDeepgramConnection = async () => {
    try {
      const deepgramApiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || '';
      if (!deepgramApiKey) {
        setError('Missing Deepgram API key (NEXT_PUBLIC_DEEPGRAM_API_KEY).');
        return;
      }

      const deepgram = createClient(deepgramApiKey);
      const connection = deepgram.listen.live({
        model: 'nova-3',
        language: 'en-US',
        smart_format: true,
        interim_results: true,
        punctuate: true,
      });
      connectionRef.current = connection;

      // Handle incoming transcripts
      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const t = data?.channel?.alternatives?.[0]?.transcript?.trim() ?? '';
        if (!t) return;

        setCurrentUtterance(t);
        setSilence(false);

        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
        silenceTimeoutRef.current = setTimeout(() => {
          const finalUtterance = (currentUtteranceRef.current || '').trim();
          console.log('⏱️ Silence detected. Final utterance:', finalUtterance);

          if (finalUtterance.length > 0) {
            setTranscript((prev) => (prev ? prev + ' ' + finalUtterance : finalUtterance));
            setConversation((prev) => [...prev, { role: 'user', text: finalUtterance }]);
            sendToServer(finalUtterance);
          }
          setCurrentUtterance('');
          setSilence(true);
        }, 1500);
      });

      connection.on(LiveTranscriptionEvents.Error, (err) => {
        console.error('Deepgram error:', err);
        setError('Deepgram error: ' + (err?.message || String(err)));
        // Only shutdown if WebSocket is also closed
        shutdownMic();
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('🔚 Deepgram connection closed');
        // Don't shutdown mic here - let WebSocket onclose handle it
        // Instead, try to restart if WebSocket is still active
        restartDeepgramIfNeeded();
      });

      connection.on(LiveTranscriptionEvents.Open, async () => {
        console.log('🟢 Deepgram connection opened');
        try {
          // Reuse existing stream if available, otherwise create new one
          if (!streamRef.current) {
            streamRef.current = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: false,
                channelCount: 1,
              },
            });
          }

          const mediaRecorder = new MediaRecorder(streamRef.current, {
            mimeType: 'audio/webm;codecs=opus',
          });
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.addEventListener('dataavailable', (event) => {
            try {
              if (event.data.size > 0 && connection.getReadyState() === 1) {
                connection.send(event.data);
              }
            } catch (e) {
              console.warn('Failed to send audio chunk to Deepgram:', e);
            }
          });
          
          mediaRecorder.addEventListener('pause', () => {
            console.log('📣 MediaRecorder event: pause (mic capturing paused).');
          });
          mediaRecorder.addEventListener('resume', () => {
            console.log('📣 MediaRecorder event: resume (mic capturing resumed).');
          });
          mediaRecorder.addEventListener('stop', () => {
            console.log('📣 MediaRecorder event: stop (mic fully stopped).');
          });

          mediaRecorder.start(250);
          setIsTranscribing(true);
          console.log('🎙️ Recording started');

          // Initially pause + disable to avoid capturing bot's greeting
          try {
            if (mediaRecorder.state === 'recording' && typeof mediaRecorder.pause === 'function') {
              mediaRecorder.pause();
              console.log('⏸️ Mic initially paused (waiting for bot greeting).');
            }
          } catch {}
          try {
            streamRef.current.getTracks().forEach((t) => (t.enabled = false));
            console.log('🎙️ Mic disabled (tracks disabled initially).');
          } catch {}

          setTimeout(() => enableMicIfSafe(), 150);
        } catch (e) {
          console.error('Mic error:', e);
          setError('Mic error: ' + (e?.message || String(e)));
          shutdownMic();
          try {
            connection.requestClose?.();
          } catch {}
        }
      });
    } catch (err) {
      console.error('Error starting Deepgram connection:', err);
      setError('Error: ' + (err?.message || String(err)));
      shutdownMic();
    }
  };

  const startTranscription = async () => {
    if (isTranscribing) return;

    setError('');
    try {
      ensureSocketConnected();
      
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('getUserMedia is not supported in this browser.');
        return;
      }

      isClosingRef.current = false;
      await startDeepgramConnection();
    } catch (err) {
      console.error('Error starting transcription:', err);
      setError('Error: ' + (err?.message || String(err)));
      setIsTranscribing(false);
    }
  };

  const stopTranscription = () => {
    setError('');
    isClosingRef.current = true;
    shouldKeepMicActiveRef.current = false; // Allow mic shutdown

    // Stop mic/recorder and timers
    shutdownMic();

    // Close Deepgram connection
    try {
      connectionRef.current?.requestClose?.();
    } catch {}
    connectionRef.current = null;

    // Close app socket
    closeSocket();

    // Stop any TTS playback
    stopAudio();

    setIsTranscribing(false);
  };

  // Keep a ref mirror for currentUtterance to avoid stale closures
  useEffect(() => {
    currentUtteranceRef.current = currentUtterance;
  }, [currentUtterance]);

  // Auto-scroll chat to the bottom when messages or the typing indicator change
  useEffect(() => {
    try {
      convoEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }, [conversation, currentUtterance, isTranscribing, silence]);

  useEffect(() => {
    return () => {
      // unmount cleanup
      stopTranscription();
      closeSocket();
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------ UI ------------------
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Live Transcription
          </h1>
          <p className="mt-2 text-lg sm:text-xl text-gray-700">
            Press Start, then speak. We’ll capture it and send it to your assistant.
          </p>
        </header>

        {/* Deepgram controls */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={startTranscription}
              disabled={isTranscribing}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              aria-pressed={isTranscribing}
            >
              <span aria-hidden>🎙️</span>
              Start Transcription
            </button>
            {/* <button
              onClick={stopTranscription}
              disabled={!isTranscribing}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span aria-hidden>⏹️</span>
              Stop Transcription
            </button> */}
          </div>

          {error && (
            <div className="mt-4 rounded-xl border-l-4 border-red-600 bg-red-50 p-4 text-red-800">
              <p className="text-lg font-semibold">Error</p>
              <p className="mt-1 text-lg leading-relaxed">{error}</p>
            </div>
          )}
        </section>

        {/* Conversation */}
        <section aria-labelledby="conversation-title">
          <h3 id="conversation-title" className="text-2xl font-bold">
            Conversation
          </h3>
          <div
            className="mt-4 rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="max-h-80 overflow-auto p-5" aria-live="polite" role="log">
              {conversation.length === 0 ? (
                <p className="text-lg text-gray-600">No messages yet</p>
              ) : (
                <ul className="space-y-3" role="list">
                  {conversation.map((m, i) => (
                    <li key={i} className="text-xl leading-relaxed">
                      <span
                        className={
                          'mr-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ' +
                          (m.role === 'user'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.role === 'bot'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-gray-200 text-gray-800')
                        }
                      >
                        {m.role === 'user' ? 'You' : m.role === 'bot' ? 'Bot' : 'System'}
                      </span>
                      <span>{m.text}</span>
                    </li>
                  ))}

                  {/* Typing indicator: shows current utterance at the bottom */}
                  {isTranscribing && !isBotSpeaking && !silence && (
                    <li className="text-xl leading-relaxed text-gray-700">
                      <span className="mr-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-emerald-100 text-emerald-800">
                        You
                      </span>
                      <span className="italic">
                        {currentUtterance || 'Listening'}
                      </span>
                      <span className="inline-flex items-center gap-1 ml-2 align-middle">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                        <span
                          className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                          style={{ animationDelay: '0.15s' }}
                        />
                        <span
                          className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                          style={{ animationDelay: '0.3s' }}
                        />
                      </span>
                    </li>
                  )}
                </ul>
              )}
              <div ref={convoEndRef} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
