"use client";

import React, { useEffect, useRef } from "react";
import SiriWave from "siriwave";

const SiriAnimation = ({ amplitude = 1, speed = 0.1, width = 400, height = 200 }) => {
  const siriRef = useRef(null);
  const siriWaveRef = useRef(null);

  useEffect(() => {
    // Prevent multiple SiriWave instances
    if (siriWaveRef.current) {
      siriWaveRef.current.dispose?.();
      siriWaveRef.current = null;
      if (siriRef.current) siriRef.current.innerHTML = "";
    }
    siriWaveRef.current = new SiriWave({
      container: siriRef.current,
      width,
      height,
      style: "ios9",
      amplitude,
      speed,
      autostart: true,
    });
    return () => {
      siriWaveRef.current?.dispose?.();
      siriWaveRef.current = null;
      if (siriRef.current) siriRef.current.innerHTML = "";
    };
  }, [amplitude, speed, width, height]);

  return (
    <div
      className="flex justify-center items-center"
  style={{ width, height }} // pushed upwards by 50%
    >
      <div ref={siriRef} style={{ width, height }} />
    </div>
  );
};

export default SiriAnimation;
