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

  const socketRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const connectionRef = useRef(null);
  const streamRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const currentUtteranceRef = useRef('');
  const isClosingRef = useRef(false);
  const convoEndRef = useRef(null);

  // Helper: stop mic, recorder, and silence timer without closing sockets
  const shutdownMic = () => {
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

  // ------------------ WebSocket helpers ------------------
  const ensureSocketConnected = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return;

    try {
      const socket = new WebSocket('ws://10.50.63.14:5001'); // replace with your server
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('✅ WebSocket connected');
      };

      socket.onmessage = (event) => {
        console.log('📩 Message from server:', event.data);
        setConversation((prev) => [...prev, { role: 'bot', text: String(event.data) }]);
      };

      socket.onclose = () => {
        console.log('❌ WebSocket closed');
        socketRef.current = null;

        // Ensure mic is closed on server-side or client-side socket close
        if (!isClosingRef.current) {
          shutdownMic();
          setIsTranscribing(false);
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
  const startTranscription = async () => {
    if (isTranscribing) return;

    setError('');
    try {
      // Ensure WebSocket is connected when starting
      ensureSocketConnected();

      const deepgramApiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || '';
      if (!deepgramApiKey) {
        setError('Missing Deepgram API key (NEXT_PUBLIC_DEEPGRAM_API_KEY).');
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('getUserMedia is not supported in this browser.');
        return;
      }

      const deepgram = createClient(deepgramApiKey);
      const connection = deepgram.listen.live({
        model: 'nova-3',
        language: 'en-US',
        smart_format: true,
        interim_results: true, // allow more frequent tokens
        punctuate: true,
      });
      connectionRef.current = connection;
      isClosingRef.current = false;

      // Handle incoming transcripts
      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const t = data?.channel?.alternatives?.[0]?.transcript?.trim() ?? '';
        if (!t) return;

        // Replace (do not append) to avoid duplicated phrases from interim updates
        setCurrentUtterance(t);
        setSilence(false);

        // Reset silence timer
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
        silenceTimeoutRef.current = setTimeout(() => {
          // 5s since last token -> treat as end of utterance
          const finalUtterance = (currentUtteranceRef.current || '').trim();
          console.log('⏱️ Silence detected. Final utterance:', finalUtterance);

          if (finalUtterance.length > 0) {
            // Commit once
            setTranscript((prev) => (prev ? prev + ' ' + finalUtterance : finalUtterance));
            setConversation((prev) => [...prev, { role: 'user', text: finalUtterance }]);
            sendToServer(finalUtterance);
          }
          setCurrentUtterance('');
          setSilence(true);
        }, 5000);
      });

      connection.on(LiveTranscriptionEvents.Error, (err) => {
        console.error('Deepgram error:', err);
        setError('Deepgram error: ' + (err?.message || String(err)));
        shutdownMic();
        setIsTranscribing(false);
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('🔚 Deepgram connection closed');
        shutdownMic();
        setIsTranscribing(false);
      });

      connection.on(LiveTranscriptionEvents.Open, async () => {
        console.log('🟢 Deepgram connection opened');
        try {
          streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(streamRef.current, {
            mimeType: 'audio/webm;codecs=opus',
          });
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.addEventListener('dataavailable', (event) => {
            // 1 means OPEN for WebSocket-like ready states
            try {
              if (event.data.size > 0 && connection.getReadyState() === 1) {
                connection.send(event.data);
              }
            } catch (e) {
              console.warn('Failed to send audio chunk to Deepgram:', e);
            }
          });

          mediaRecorder.start(250);
          setIsTranscribing(true);
          console.log('🎙️ Recording started');
        } catch (e) {
          console.error('Mic error:', e);
          setError('Mic error: ' + (e?.message || String(e)));
          setIsTranscribing(false);
          try {
            connection.requestClose?.();
          } catch {}
        }
      });
    } catch (err) {
      console.error('Error starting transcription:', err);
      setError('Error: ' + (err?.message || String(err)));
      setIsTranscribing(false);
    }
  };

  const stopTranscription = () => {
    setError('');
    isClosingRef.current = true;

    // Stop mic/recorder and timers
    shutdownMic();

    // Close Deepgram connection
    try {
      connectionRef.current?.requestClose?.();
    } catch {}
    connectionRef.current = null;

    // Close app socket
    closeSocket();

    setIsTranscribing(false);
  };

  useEffect(() => {
    return () => {
      // unmount cleanup
      stopTranscription();
      closeSocket();
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
                  {isTranscribing && !silence && (
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
