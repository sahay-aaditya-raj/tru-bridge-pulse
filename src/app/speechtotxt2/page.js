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
    <div>
      <h2>Live Transcription</h2>

      {/* Deepgram controls */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={startTranscription} disabled={isTranscribing}>
          Start Transcription
        </button>
        <button onClick={stopTranscription} disabled={!isTranscribing}>
          Stop Transcription
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Transcript view */}
      <p><strong>Full transcript:</strong> {transcript}</p>
      <p><strong>Current utterance:</strong> {currentUtterance}</p>
      {silence && <p style={{ color: 'orange' }}>User stopped speaking</p>}

      <hr style={{ margin: '1.5rem 0' }} />

      {/* Conversation */}
      <h3>Conversation</h3>
      <div style={{ border: '1px solid #ccc', padding: '0.75rem', borderRadius: 6, minHeight: 100 }}>
        {conversation.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No messages yet</p>
        ) : (
          conversation.map((m, i) => (
            <p key={i} style={{ margin: '0.25rem 0' }}>
              <strong>{m.role === 'user' ? 'You' : m.role === 'bot' ? 'Bot' : 'System'}:</strong> {m.text}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
