"use client";

import { useEffect, useRef } from "react";

export default function Home() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let audioCtx = null;
    let analyser, dataArray, source;
    let animationFrameId;
    let prevOffsets = null; // for temporal smoothing

    async function setupAudio() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512; // frequencyBinCount = 256
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      draw();
    }

    function movingAverage(arr, windowSize) {
      const out = new Array(arr.length).fill(0);
      let sum = 0;
      const half = Math.floor(windowSize / 2);
      for (let i = 0; i < arr.length + half; i++) {
        if (i < arr.length) sum += arr[i];
        if (i - windowSize >= 0) sum -= arr[i - windowSize];
        if (i >= windowSize - 1) {
          const idx = i - half;
          if (idx >= 0 && idx < arr.length) out[idx] = sum / windowSize;
        }
      }
      for (let i = 0; i < arr.length; i++) {
        if (isNaN(out[i])) out[i] = i > 0 ? out[i - 1] : arr[i];
      }
      return out;
    }

    function expSmooth(arr, alpha) {
      const out = new Array(arr.length);
      let prev = arr[0] || 0;
      for (let i = 0; i < arr.length; i++) {
        prev = alpha * arr[i] + (1 - alpha) * prev;
        out[i] = prev;
      }
      return out;
    }

    function softCompress(arr, gain, maxAbs) {
      return arr.map((v) => {
        const g = v * gain;
        const c = Math.tanh(g);
        return Math.max(-maxAbs, Math.min(maxAbs, c));
      });
    }

    // Optional: wavelength increase helpers (keep if you previously enabled it)
    function cubicInterpolate(p0, p1, p2, p3, t) {
      const a0 = -0.5*p0 + 1.5*p1 - 1.5*p2 + 0.5*p3;
      const a1 = p0 - 2.5*p1 + 2*p2 - 0.5*p3;
      const a2 = -0.5*p0 + 0.5*p2;
      const a3 = p1;
      return ((a0 * t + a1) * t + a2) * t + a3;
    }
    function getWrapped(arr, idx) {
      const n = arr.length;
      return arr[(idx % n + n) % n];
    }
    function resampleCubicLooped(arr, targetLength) {
      const n = arr.length;
      const out = new Array(targetLength);
      for (let i = 0; i < targetLength; i++) {
        const x = (i / targetLength) * n;
        const i1 = Math.floor(x);
        const t = x - i1;
        const p0 = getWrapped(arr, i1 - 1);
        const p1 = getWrapped(arr, i1);
        const p2 = getWrapped(arr, i1 + 1);
        const p3 = getWrapped(arr, i1 + 2);
        out[i] = cubicInterpolate(p0, p1, p2, p3, t);
      }
      return out;
    }

    function draw() {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = 130;

      // Movement cap: ±35% of base radius
      const maxOffset = Math.round(baseRadius * 0.35);

      // Visual styling
      const ringColor = "#FF7A00";
      const fillColor = " rgba(255, 122, 0, 0.20)"; // slightly transparent inner fill for depth
      const outerLineWidth = 20;
      const innerBodyWidth = 40;
      const glow = 40;

      // Normalize and denoise
      let normalized = Array.from(dataArray, (v) => (v - 128) / 128);
      const noiseThreshold = 0.10;
      normalized = normalized.map((v) => (Math.abs(v) < noiseThreshold ? 0 : v));

      // Spatial smoothing
      const maWindow = 15;
      let smooth = movingAverage(normalized, maWindow);
      smooth = expSmooth(smooth, 0.2);

      // Optional wavelength extension (comment out to disable)
      // const downsampleFactor = 3;
      // const reduced = [];
      // for (let i = 0; i < smooth.length; i += downsampleFactor) {
      //   let acc = 0, cnt = 0;
      //   for (let k = 0; k < downsampleFactor && i + k < smooth.length; k++) {
      //     acc += smooth[i + k];
      //     cnt++;
      //   }
      //   reduced.push(acc / cnt);
      // }
      // const shaped = resampleCubicLooped(reduced, smooth.length);

      const shaped = smooth; // or use long-wave resampled array above

      // Compression and amplitude scaling
      const compressed = softCompress(shaped, 1.8, 0.40);
      const preliminaryAmp = 90;
      let offsetsNow = compressed.map((v) => Math.max(-1, Math.min(1, v)) * preliminaryAmp);

      // Hard cap
      offsetsNow = offsetsNow.map((v) => Math.max(-maxOffset, Math.min(maxOffset, v)));

      // Temporal smoothing for slower relocation
      const alphaTemporal = 0.34; // lower == slower
      if (!prevOffsets || prevOffsets.length !== offsetsNow.length) {
        prevOffsets = Float32Array.from(offsetsNow);
      } else {
        for (let i = 0; i < offsetsNow.length; i++) {
          prevOffsets[i] = (1 - alphaTemporal) * prevOffsets[i] + alphaTemporal * offsetsNow[i];
        }
      }
      const offsets = prevOffsets;

      // Compute min radius to choose a safe inner fill radius
      let minR = baseRadius + offsets[0];
      for (let i = 1; i < offsets.length; i++) {
        const r = baseRadius + offsets[i];
        if (r < minR) minR = r;
      }
      // Choose inner fill radius that stays strictly inside the minimum outer radius
      // Subtract a margin equal to half of the stroke thickness for safety
      const innerFillRadius = Math.max(10, minR - outerLineWidth * 0.6);

      // 1) Fill the inner circle (static)
      ctx.save();
      ctx.fillStyle = fillColor; // same family as ringColor
      ctx.beginPath();
      ctx.arc(cx, cy, innerFillRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 2) Draw the animated outer path
      ctx.beginPath();
      for (let i = 0; i <= offsets.length; i++) {
        const idx = i % offsets.length;
        const angle = (idx / offsets.length) * Math.PI * 2;

        const r = baseRadius + offsets[idx];
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevIdx = (idx - 1 + offsets.length) % offsets.length;
          const prevAngle = (prevIdx / offsets.length) * Math.PI * 2;
          const prevR = baseRadius + offsets[prevIdx];
          const prevX = cx + prevR * Math.cos(prevAngle);
          const prevY = cy + prevR * Math.sin(prevAngle);

          const midX = (prevX + x) / 2;
          const midY = (prevY + y) / 2;

          ctx.quadraticCurveTo(prevX, prevY, midX, midY);
        }
      }
      ctx.closePath();

      // Stroke with glow
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = outerLineWidth;
      ctx.shadowBlur = glow;
      ctx.shadowColor = ringColor;
      ctx.stroke();

      // Optional: inner body stroke for heft
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = innerBodyWidth;
      ctx.strokeStyle = "rgba(0,240,255,0.15)";
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(draw);
    }

    setupAudio();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (audioCtx) audioCtx.close();
    };
  }, []);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <canvas ref={canvasRef} width={560} height={560} />
    </div>
  );
}
