"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import CircleAnimation from "../chat_avatar/CircleAnimation";
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

function HomePage() {
  // State variables
  const [conversation, setConversation] = useState([]);
  const [currentUtterance, setCurrentUtterance] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState('');
  const [silence, setSilence] = useState(true);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [ttsQueue, setTtsQueue] = useState([]);
  const [currentTTSAudio, setCurrentTTSAudio] = useState(null);

  // Refs
  const convoEndRef = useRef(null);
  const currentUtteranceRef = useRef("");
  const connectionRef = useRef(null);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const shouldKeepMicActiveRef = useRef(false);
  const isClosingRef = useRef(false);
  const ttsProcessingRef = useRef(false);

  // TTS Functions
  const stopAudio = useCallback(() => {
    if (currentTTSAudio) {
      try {
        currentTTSAudio.pause();
        currentTTSAudio.currentTime = 0;
      } catch (err) {
        console.warn('Error stopping audio:', err);
      }
      setCurrentTTSAudio(null);
    }
    setIsBotSpeaking(false);
    setTtsQueue([]);
    ttsProcessingRef.current = false;
  }, [currentTTSAudio]);

  const processTTSQueue = useCallback(async () => {
    if (ttsProcessingRef.current || ttsQueue.length === 0) return;
    
    ttsProcessingRef.current = true;
    const textToSpeak = ttsQueue[0];
    
    try {
      setIsBotSpeaking(true);
      
      // Create speech synthesis
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setTtsQueue(prev => prev.slice(1));
        setIsBotSpeaking(false);
        ttsProcessingRef.current = false;
        
        // Enable mic after bot finishes speaking
        setTimeout(() => enableMicIfSafe(), 500);
      };
      
      utterance.onerror = (err) => {
        console.error('Speech synthesis error:', err);
        setTtsQueue(prev => prev.slice(1));
        setIsBotSpeaking(false);
        ttsProcessingRef.current = false;
        setTimeout(() => enableMicIfSafe(), 500);
      };
      
      // Pause mic while bot is speaking
      disableMicForBot();
      
      speechSynthesis.speak(utterance);
      
    } catch (err) {
      console.error('TTS processing error:', err);
      setTtsQueue(prev => prev.slice(1));
      setIsBotSpeaking(false);
      ttsProcessingRef.current = false;
    }
  }, [ttsQueue]);

  const enqueueTTS = useCallback((text) => {
    if (!text?.trim()) return;
    setTtsQueue(prev => [...prev, text.trim()]);
  }, []);

  const splitIntoTTSChunks = useCallback((text, maxLen = 240) => {
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
      } catch (err) {
        console.warn('Intl.Segmenter not available:', err);
      }
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
  }, []);

  const enqueueTTSChunks = useCallback((text) => {
    const chunks = splitIntoTTSChunks(text);
    chunks.forEach(chunk => enqueueTTS(chunk));
  }, [splitIntoTTSChunks, enqueueTTS]);

  // Process TTS queue
  useEffect(() => {
    processTTSQueue();
  }, [ttsQueue, processTTSQueue]);

  // Microphone control functions
  const enableMicIfSafe = useCallback(() => {
    if (!isBotSpeaking && mediaRecorderRef.current && streamRef.current && !isClosingRef.current) {
      try {
        // Enable microphone tracks
        streamRef.current.getTracks().forEach((track) => {
          track.enabled = true;
        });
        
        // Resume recording if paused
        if (mediaRecorderRef.current.state === 'paused') {
          mediaRecorderRef.current.resume();
          console.log('🎙️ Mic resumed');
        }
      } catch (err) {
        console.warn('Failed to enable mic:', err);
      }
    }
  }, [isBotSpeaking]);

  const disableMicForBot = useCallback(() => {
    if (mediaRecorderRef.current && streamRef.current) {
      try {
        // Disable microphone tracks
        streamRef.current.getTracks().forEach((track) => {
          track.enabled = false;
        });
        
        // Pause recording
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.pause();
          console.log('⏸️ Mic paused for bot speech');
        }
      } catch (err) {
        console.warn('Failed to disable mic:', err);
      }
    }
  }, []);

  // Helper: stop mic, recorder, and silence timer
  const shutdownMic = useCallback(() => {
    if (!shouldKeepMicActiveRef.current) {
      console.log('🔇 Shutting down mic (WebSocket closed or explicit stop)');
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch (err) {
        console.warn('Error stopping media recorder:', err);
      }
      mediaRecorderRef.current = null;

      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach((track) => track.stop());
        } catch (err) {
          console.warn('Error stopping stream tracks:', err);
        }
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
  }, []);

  // Auto-restart Deepgram connection if it closes but WebSocket is still open
  const restartDeepgramIfNeeded = useCallback(async () => {
    if (shouldKeepMicActiveRef.current && 
        socketRef.current && 
        socketRef.current.readyState === WebSocket.OPEN &&
        !isClosingRef.current) {
      console.log('🔄 Restarting Deepgram connection (WebSocket still active)');
      setTimeout(() => {
        if (shouldKeepMicActiveRef.current) {
          startDeepgramConnection();
        }
      }, 1000);
    }
  }, []);

  // WebSocket helpers
  const ensureSocketConnected = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const socket = new WebSocket('ws://10.50.63.14:5001');
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('✅ WebSocket connected');
        shouldKeepMicActiveRef.current = true;
        setError('');
      };

      socket.onmessage = (event) => {
        try {
          const msg = String(event.data);
          console.log('📩 Message from server:', msg);
          setConversation((prev) => [...prev, { role: 'bot', text: msg }]);
          enqueueTTSChunks(msg);
        } catch (err) {
          console.error('Error processing message:', err);
        }
      };

      socket.onclose = (event) => {
        console.log('❌ WebSocket closed:', event.code, event.reason);
        shouldKeepMicActiveRef.current = false;
        socketRef.current = null;

        if (!isClosingRef.current) {
          shutdownMic();
          setError('WebSocket connection lost. Please restart transcription.');
        }
      };

      socket.onerror = (err) => {
        console.error('⚠️ WebSocket error:', err);
        setError('WebSocket connection error. Check your network connection.');
      };

    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setError(`WebSocket connection failed: ${err.message}`);
      throw err;
    }
  }, [shutdownMic, enqueueTTSChunks]);

  const closeSocket = useCallback(() => {
    shouldKeepMicActiveRef.current = false;
    const sock = socketRef.current;
    if (sock) {
      try {
        sock.close();
      } catch (err) {
        console.warn('Error closing socket:', err);
      }
      socketRef.current = null;
    }
  }, []);

  const sendToServer = useCallback((msg) => {
    const trimmed = msg.trim();
    if (!trimmed) return;
    
    const sock = socketRef.current;
    if (sock && sock.readyState === WebSocket.OPEN) {
      sock.send(trimmed);
      console.log('📤 Sent to server:', trimmed);
    } else {
      console.warn('⚠️ Socket not open; could not send:', trimmed);
    }
  }, []);

  // Deepgram Transcription
  const startDeepgramConnection = useCallback(async () => {
    try {
      const deepgramApiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || '';
      if (!deepgramApiKey) {
        throw new Error('Missing Deepgram API key (NEXT_PUBLIC_DEEPGRAM_API_KEY).');
      }

      const deepgram = createClient(deepgramApiKey);
      const connection = deepgram.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: true,
        punctuate: true,
        diarize: false,
      });
      
      connectionRef.current = connection;

      // Handle incoming transcripts
      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const t = data?.channel?.alternatives?.[0]?.transcript?.trim() ?? '';
        if (!t) return;

        const isFinal = data?.is_final ?? false;
        
        if (isFinal) {
          console.log('📝 Final transcript:', t);
          setCurrentUtterance(prev => {
            const newUtterance = prev.trim() ? `${prev.trim()} ${t}` : t;
            currentUtteranceRef.current = newUtterance;
            return newUtterance;
          });
        } else {
          console.log('📝 Interim transcript:', t);
          setCurrentUtterance(t);
        }
        
        setSilence(false);

        // Reset silence timer on any transcript
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
          currentUtteranceRef.current = '';
          setSilence(true);
        }, 1500);
      });

      connection.on(LiveTranscriptionEvents.Error, (err) => {
        console.error('Deepgram error:', err);
        setError('Deepgram error: ' + (err?.message || String(err)));
        shutdownMic();
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('🔚 Deepgram connection closed');
        restartDeepgramIfNeeded();
      });

      connection.on(LiveTranscriptionEvents.Open, async () => {
        console.log('🟢 Deepgram connection opened');
        try {
          if (!streamRef.current) {
            streamRef.current = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: false,
                channelCount: 1,
                sampleRate: 16000,
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
          
          mediaRecorder.addEventListener('stop', () => {
            console.log('📣 MediaRecorder stopped');
          });

          mediaRecorder.start(250);
          setIsTranscribing(true);
          console.log('🎙️ Recording started');

          // Initially disable to avoid capturing bot's greeting
          try {
            streamRef.current.getTracks().forEach((t) => (t.enabled = false));
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.pause();
            }
            console.log('🎙️ Mic initially disabled');
          } catch (err) {
            console.warn('Error initially disabling mic:', err);
          }

          setTimeout(() => enableMicIfSafe(), 500);
          
        } catch (e) {
          console.error('Mic error:', e);
          setError('Microphone error: ' + (e?.message || String(e)));
          shutdownMic();
          try {
            connection.requestClose?.();
          } catch {}
        }
      });
      
    } catch (err) {
      console.error('Error starting Deepgram connection:', err);
      setError(`Deepgram connection failed: ${err.message}`);
      setIsTranscribing(false);
    }
  }, [shutdownMic, restartDeepgramIfNeeded, enableMicIfSafe, sendToServer]);

  const startTranscription = useCallback(async () => {
    if (isTranscribing) return;

    setError('');
    try {
      ensureSocketConnected();
      
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser.');
      }

      isClosingRef.current = false;
      await startDeepgramConnection();
      
    } catch (err) {
      console.error('Error starting transcription:', err);
      setError('Error: ' + (err?.message || String(err)));
      setIsTranscribing(false);
    }
  }, [isTranscribing, ensureSocketConnected, startDeepgramConnection]);

  const stopTranscription = useCallback(() => {
    setError('');
    isClosingRef.current = true;
    shouldKeepMicActiveRef.current = false;

    // Stop mic/recorder and timers
    shutdownMic();

    // Close Deepgram connection
    try {
      connectionRef.current?.requestClose?.();
    } catch (err) {
      console.warn('Error closing Deepgram connection:', err);
    }
    connectionRef.current = null;

    // Close app socket
    closeSocket();

    // Stop any TTS playback
    stopAudio();

    setIsTranscribing(false);
  }, [shutdownMic, closeSocket, stopAudio]);

  // Keep a ref mirror for currentUtterance to avoid stale closures
  useEffect(() => {
    currentUtteranceRef.current = currentUtterance;
  }, [currentUtterance]);

  // Auto-scroll chat to the bottom when messages or the typing indicator change
  useEffect(() => {
    try {
      convoEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.warn('Error scrolling to bottom:', err);
    }
  }, [conversation, currentUtterance, isTranscribing, silence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isClosingRef.current = true;
      shouldKeepMicActiveRef.current = false;
      
      // Clear all timeouts
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      
      // Stop all media tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          try {
            track.stop();
          } catch {}
        });
      }
      
      // Close connections
      try {
        connectionRef.current?.requestClose?.();
      } catch {}
      
      try {
        socketRef.current?.close();
      } catch {}
      
      // Stop TTS
      try {
        speechSynthesis.cancel();
      } catch {}
    };
  }, []);

  // UI state
  const showThematic = isTranscribing;
  
  // Caption: current speech (user or bot)
  let captionText = '';
  if (isBotSpeaking && conversation.length > 0) {
    const lastBotMsg = [...conversation].reverse().find(m => m.role === 'bot');
    captionText = lastBotMsg?.text || '';
  } else if (!silence && currentUtterance) {
    captionText = currentUtterance;
  }

  return (
    <main className={showThematic ? 'min-h-screen bg-black text-white flex flex-col items-center justify-center' : 'min-h-screen bg-gray-50 text-gray-900'}>
      {!showThematic && (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Live Transcription
            </h1>
            <p className="mt-2 text-lg sm:text-xl text-gray-700">
              Press Start, then speak. We'll capture it and send it to your assistant.
            </p>
          </header>
          
          <section className="mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={startTranscription}
                disabled={isTranscribing}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                aria-pressed={isTranscribing}
              >
                <span aria-hidden>🎙️</span>
                {isTranscribing ? 'Transcribing...' : 'Start Transcription'}
              </button>
              
              {isTranscribing && (
                <button
                  onClick={stopTranscription}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
                >
                  <span aria-hidden>🛑</span>
                  Stop
                </button>
              )}
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
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
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
                  </ul>
                )}
                <div ref={convoEndRef} />
              </div>
            </div>
          </section>
        </div>
      )}
      
      {showThematic && (
        <>
          <div className="flex flex-col items-center justify-start w-full h-full" style={{ minHeight: '60vh', paddingTop: '14.2857vh' }}>
            {/* Animate amplitude: small regular movement when audio is coming from user or system */}
            <CircleAnimation amplitude={
              isBotSpeaking || (!silence && isTranscribing) ? 2.5 : (!silence || isTranscribing ? 1.2 : 1)
            } />
          </div>
          
          <div className="fixed bottom-0 left-0 w-full pb-6" style={{ paddingLeft: '16.6667vw', paddingRight: '16.6667vw' }}>
            <div className="max-h-64 overflow-auto rounded-2xl border border-gray-800 bg-black/80 shadow-lg p-5" aria-live="polite" role="log">
              {conversation.length === 0 ? (
                <p className="text-lg text-gray-400">No messages yet</p>
              ) : (
                <ul className="space-y-3" role="list">
                  {conversation.map((m, i) => (
                    <li key={i} className="text-xl leading-relaxed">
                      <span
                        className={
                          'mr-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ' +
                          (m.role === 'user'
                            ? 'bg-emerald-800 text-white'
                            : m.role === 'bot'
                            ? 'bg-indigo-800 text-white'
                            : 'bg-gray-700 text-white')
                        }
                      >
                        {m.role === 'user' ? 'You' : m.role === 'bot' ? 'Bot' : 'System'}
                      </span>
                      <span>{m.text}</span>
                    </li>
                  ))}
                  
                  {isTranscribing && !isBotSpeaking && !silence && (
                    <li className="text-xl leading-relaxed text-gray-300">
                      <span className="mr-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-emerald-800 text-white">
                        You
                      </span>
                      <span className="italic">
                        {currentUtterance || 'Listening'}
                      </span>
                      <span className="inline-flex items-center gap-1 ml-2 align-middle">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                      </span>
                    </li>
                  )}
                </ul>
              )}
              <div ref={convoEndRef} />
            </div>
          </div>
          
          {/* Stop button in thematic mode */}
          <button
            onClick={stopTranscription}
            className="fixed top-6 right-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
          >
            <span aria-hidden>🛑</span>
            Stop
          </button>
        </>
      )}
    </main>
  );
}

export default HomePage;
