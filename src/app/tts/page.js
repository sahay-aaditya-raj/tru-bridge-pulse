'use client'
import { useRef, useState } from 'react';
import { createClient, LiveTTSEvents } from '@deepgram/sdk';

export default function LiveTTS() {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioCtxRef = useRef(null);

  const handleSpeak = async () => {
    setIsSpeaking(true);
    const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
    if (!apiKey) {
      alert('Missing Deepgram API key');
      return;
    }
    const deepgram = createClient(apiKey);
    const dgConnection = deepgram.speak.live({
      model: 'aura-2-thalia-en',
      encoding: 'linear16',
      sample_rate: 48000,
    });

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
    }
    const audioCtx = audioCtxRef.current;

    dgConnection.on(LiveTTSEvents.Open, () => {
      dgConnection.sendText(text);
      dgConnection.flush();
    });

    dgConnection.on(LiveTTSEvents.Audio, (data) => {
      // Play each audio chunk as it arrives
      audioCtx.decodeAudioData(data.buffer.slice(0), (buffer) => {
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
      });
    });

    dgConnection.on(LiveTTSEvents.Flushed, () => {
      setIsSpeaking(false);
      dgConnection.requestClose();
    });

    dgConnection.on(LiveTTSEvents.Error, (err) => {
      alert('TTS error: ' + (err?.message || String(err)));
      setIsSpeaking(false);
      dgConnection.requestClose();
    });
  };

  return (
    <div>
      <h1>Live Deepgram TTS (aura-2-thalia-en)</h1>
      <textarea
        rows={3}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Enter text to synthesize"
      />
      <br />
      <button onClick={handleSpeak} disabled={isSpeaking || !text}>
        {isSpeaking ? 'Speaking...' : 'Speak Live'}
      </button>
    </div>
  );
}