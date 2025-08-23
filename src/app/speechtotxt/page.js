// app/components/LiveTranscription.js (or pages/LiveTranscription.js)
'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

export default function LiveTranscription() {
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef(null);
  const connectionRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream;

    async function startTranscription() {
      try {
        // Replace with your Deepgram API key (for demo only)
        const deepgramApiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || '';

        // Create Deepgram client
        const deepgram = createClient(deepgramApiKey);

        // Create live transcription connection
        const connection = deepgram.listen.live({
          model: 'nova-3',
          language: 'en-US', // Change to your desired language code
          smart_format: true,
        });
        connectionRef.current = connection;

        // Listen for transcript events
        connection.on(LiveTranscriptionEvents.Transcript, (data) => {
          const t = data.channel.alternatives[0].transcript;
          if (t) setTranscript((prev) => prev + ' ' + t);
        });

        connection.on(LiveTranscriptionEvents.Error, (err) => {
          setError('Deepgram error: ' + (err.message || err));
          console.error('Deepgram error:', err);
        });

        connection.on(LiveTranscriptionEvents.Open, async () => {
          // Get microphone stream
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.addEventListener('dataavailable', (event) => {
            if (event.data.size > 0 && connection.getReadyState() === 1) {
              connection.send(event.data);
            }
          });

          mediaRecorder.start(250); // Send audio every 250ms
        });
      } catch (err) {
        setError('Error: ' + err.message);
        console.error(err);
      }
    }

    startTranscription();

    // Cleanup on unmount
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (connectionRef.current) {
        connectionRef.current.finish();
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div>
      <h2>Live Transcription</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>{transcript}</p>
    </div>
  );
}