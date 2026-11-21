// The built-in composition of remotion/player: a frame ruler. It shows what a Remotion composition is, a picture that is a function of the frame number.
// Your own component (the kind lessons 2 and 3 render to video) is played the same way: {"kind": "remotion/player", "component": "./My.tsx"}.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

type Props = {label?: string; ink?: string; accent?: string; gold?: string; dim?: string};

export default function FrameRuler({label = 'A Remotion composition', ink = '#F6F3EC', accent = '#F2B45A', gold = '#D6892A', dim = 'rgba(235,226,210,0.62)'}: Props) {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const tall = height >= width;
  const u = tall ? width / 560 : width / 1000;                 // one design unit
  const last = durationInFrames - 1;
  const padX = (tall ? 44 : 70) * u, railW = width - padX * 2;
  const grow = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3)});
  const head = interpolate(frame, [8, last], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pop = spring({frame: frame - 4, fps, config: {damping: 16, stiffness: 120}});
  const ticks = tall ? 31 : 46;
  const keys = [0.18, 0.5, 0.82];
  return (
    <AbsoluteFill style={{fontFamily: '"Inter", -apple-system, "Helvetica Neue", "Segoe UI", sans-serif', color: ink, justifyContent: 'center'}}>
      <div style={{padding: `0 ${padX}px`, display: 'flex', flexDirection: 'column', gap: 26 * u}}>
        <div style={{fontSize: (tall ? 22 : 17) * u, letterSpacing: '0.32em', textTransform: 'uppercase', color: accent, opacity: pop}}>{label}</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16 * u, opacity: pop, transform: `translateY(${(1 - pop) * 30 * u}px)`}}>
          <div style={{fontSize: 150 * u, fontWeight: 200, letterSpacing: '-0.04em', lineHeight: 0.95, fontVariantNumeric: 'tabular-nums'}}>{String(frame).padStart(3, '0')}</div>
          <div style={{fontSize: 34 * u, fontWeight: 300, color: dim, fontVariantNumeric: 'tabular-nums'}}>/ {String(last).padStart(3, '0')} frames</div>
        </div>
        <div style={{position: 'relative', height: 78 * u, width: railW}}>
          {Array.from({length: ticks}).map((_, i) => {
            const x = i / (ticks - 1), on = x <= grow, passed = x <= head, major = i % 5 === 0;
            return <div key={i} style={{position: 'absolute', left: x * railW, bottom: 22 * u, width: Math.max(1, 1.4 * u), height: (major ? 30 : 16) * u, background: passed ? accent : ink, opacity: on ? (passed ? 1 : 0.34) : 0}} />;
          })}
          <div style={{position: 'absolute', left: 0, bottom: 22 * u, height: Math.max(1, 1.4 * u), width: railW * grow, background: ink, opacity: 0.3}} />
          <div style={{position: 'absolute', left: 0, bottom: 22 * u, height: Math.max(2, 2.4 * u), width: railW * head, background: gold}} />
          {keys.map((k, i) => {
            const lit = head >= k, s = spring({frame: frame - (8 + k * (last - 8)), fps, config: {damping: 11, stiffness: 180}});
            return <div key={i} style={{position: 'absolute', left: k * railW - 7 * u, bottom: 0, width: 14 * u, height: 14 * u, transform: `rotate(45deg) scale(${lit ? 0.8 + 0.4 * s : 0.8})`, border: `${Math.max(1, 1.4 * u)}px solid ${lit ? accent : dim}`, background: lit ? accent : 'transparent', opacity: grow}} />;
          })}
          <div style={{position: 'absolute', left: head * railW - 1 * u, bottom: 12 * u, width: Math.max(2, 2 * u), height: 62 * u, background: accent, opacity: grow}} />
        </div>
      </div>
    </AbsoluteFill>
  );
}
