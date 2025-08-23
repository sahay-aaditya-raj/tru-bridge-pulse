'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

export default function LiveTranscription() {
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [silence, setSilence] = useState(false);

  const [socketConnected, setSocketConnected] = useState(false);
  const [socketMessage, setSocketMessage] = useState(''); // message input
  const socketRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const connectionRef = useRef(null);
  const streamRef = useRef(null);
  const silenceTimeoutRef = useRef(null);

  // ------------------ Deepgram Transcription ------------------
  const startTranscription = async () => {
    if (isTranscribing) return;

    setError('');
    try {
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
      });
      connectionRef.current = connection;

      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const t = data.channel.alternatives?.[0]?.transcript;
        if (t) {
          setTranscript((prev) => (prev ? prev + ' ' + t : t));
          setSilence(false);

          if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = setTimeout(() => {
            console.log('stopped speaking');
            setSilence(true);
          }, 5000);
        }
      });

      connection.on(LiveTranscriptionEvents.Error, (err) => {
        setError('Deepgram error: ' + (err?.message || String(err)));
        setIsTranscribing(false);
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        setIsTranscribing(false);
      });

      connection.on(LiveTranscriptionEvents.Open, async () => {
        try {
          streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(streamRef.current, {
            mimeType: 'audio/webm;codecs=opus',
          });
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.addEventListener('dataavailable', (event) => {
            if (event.data.size > 0 && connection.getReadyState() === 1) {
              connection.send(event.data);
            }
          });

          mediaRecorder.start(250);
          setIsTranscribing(true);
        } catch (e) {
          setError('Mic error: ' + (e?.message || String(e)));
          setIsTranscribing(false);
          try {
            connection.requestClose();
          } catch {}
        }
      });
    } catch (err) {
      setError('Error: ' + (err?.message || String(err)));
      setIsTranscribing(false);
    }
  };

  const stopTranscription = () => {
    setError('');
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch {}
    try {
      if (connectionRef.current) {
        connectionRef.current.finish();
      }
    } catch {}
    connectionRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    setIsTranscribing(false);
    setSilence(false);
  };

  useEffect(() => {
    return () => {
      stopTranscription();
      closeSocket();
    };
  }, []);

  // ------------------ WebSocket Feature ------------------
  const connectSocket = () => {
    if (socketRef.current) return;
    try {
      const socket = new WebSocket('ws://10.50.63.14:5001'); // replace with your server
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('✅ WebSocket connected');
        setSocketConnected(true);
      };

      socket.onmessage = (event) => {
        console.log('📩 Message from server:', event.data);
      };

      socket.onclose = () => {
        console.log('❌ WebSocket closed');
        setSocketConnected(false);
        socketRef.current = null;
      };

      socket.onerror = (err) => {
        console.error('⚠️ WebSocket error:', err);
        setSocketConnected(false);
      };
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
    }
  };

  const closeSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setSocketConnected(false);
    }
  };

  const sendMessage = () => {
    if (socketRef.current && socketConnected && socketMessage.trim() !== '') {
      socketRef.current.send(socketMessage);
      console.log('📤 Sent to server:', socketMessage);
      setSocketMessage('');
    }
  };

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
      <p>{transcript}</p>
      {silence && <p style={{ color: 'orange' }}>User stopped speaking</p>}

      <hr style={{ margin: '1.5rem 0' }} />

      {/* WebSocket controls */}
      <h3>WebSocket Connection</h3>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={connectSocket} disabled={socketConnected}>
          Connect WebSocket
        </button>
        <button onClick={closeSocket} disabled={!socketConnected}>
          Close WebSocket
        </button>
      </div>
      <p>Status: {socketConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>

      {/* Message sender */}
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={socketMessage}
          onChange={(e) => setSocketMessage(e.target.value)}
          placeholder="Type a message"
          style={{ flex: 1, padding: '0.5rem' }}
          disabled={!socketConnected}
        />
        <button onClick={sendMessage} disabled={!socketConnected || !socketMessage.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
