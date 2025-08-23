"use client";

import React, { useEffect, useRef } from "react";
import SiriWave from "siriwave";

const SiriAnimation = () => {
  const siriRef = useRef(null);
  const siriWaveRef = useRef(null);

  useEffect(() => {
    // Init SiriWave
    siriWaveRef.current = new SiriWave({
      container: siriRef.current,
      width: 400,
      height: 200,
      style: "ios9", // closest to Siri
      amplitude: 1,
      speed: 0.1,
      autostart: true,
    });

    // Microphone setup
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const update = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg =
          dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;

        // Map volume → amplitude
        siriWaveRef.current.setAmplitude(2 + avg * 10);

        requestAnimationFrame(update);
      };
      update();
    });
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div ref={siriRef} className="w-[400px] h-[200px]" />
    </div>
  );
};

export default SiriAnimation;
