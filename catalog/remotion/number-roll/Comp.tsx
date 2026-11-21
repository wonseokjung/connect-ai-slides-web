// A Remotion composition: every digit rolls up through 0-9 to its place, one after another; the unit and a label follow.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

type Props = {value?: number | string; unit?: string; label?: string; kicker?: string; ink?: string; accent?: string; gold?: string; dim?: string};

export default function NumberRoll({value = 10, unit = '', label = '', kicker = '', ink = '#F6F3EC', accent = '#F2B45A', gold = '#D6892A', dim = 'rgba(235,226,210,0.62)'}: Props) {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const tall = height > width;
  const chars = String(value).split('');
  const n = chars.length;
  const size = Math.min((tall ? width * 0.86 : width * 0.5) / Math.max(1.6, n * 0.62), height * (tall ? 0.34 : 0.56));
  const u = size / 300;
  const lineH = 1.0;
  const after = 10 + n * 5 + 16;
  const fade = (from: number) => interpolate(frame - from, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rule = interpolate(frame - after + 6, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3)});
  let digitIndex = 0;
  return (
    <AbsoluteFill style={{fontFamily: '"Inter", -apple-system, "Helvetica Neue", "Segoe UI", sans-serif', color: ink, justifyContent: 'center', alignItems: tall ? 'center' : 'flex-start', padding: tall ? `0 ${width * 0.07}px` : `0 ${width * 0.07}px`}}>
      <div style={{display: 'flex', flexDirection: tall ? 'column' : 'row', alignItems: tall ? 'center' : 'center', gap: tall ? 40 * u : 90 * u, textAlign: tall ? 'center' : 'left'}}>
        <div role="img" aria-label={String(value) + (unit ? ' ' + unit : '')} style={{display: 'flex', alignItems: 'flex-end', fontSize: size, fontWeight: 200, letterSpacing: '-0.04em', lineHeight: lineH, fontVariantNumeric: 'tabular-nums'}}>
          {chars.map((c, i) => {
            if (!/\d/.test(c)) return <div key={i} aria-hidden="true" style={{opacity: fade(6 + i * 5)}}>{c}</div>;
            const k = digitIndex++;
            const s = spring({frame: frame - 6 - k * 5, fps, config: {damping: 18, stiffness: 70, mass: 0.9}, durationInFrames: 40});
            const steps = 10 + Number(c);                // one full turn, then on to the digit
            const y = -s * steps;
            return (
              <div key={i} aria-hidden="true" style={{height: `${lineH}em`, overflow: 'hidden', opacity: interpolate(frame - 6 - k * 5, [0, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
                <div style={{transform: `translateY(${y * lineH}em)`}}>
                  {Array.from({length: 20}).map((_, d) => <div key={d} style={{height: `${lineH}em`}}>{d % 10}</div>)}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: tall ? 'center' : 'flex-start', gap: (tall ? 26 : 17) * u, maxWidth: tall ? width * 0.86 : width * 0.34}}>
          {kicker ? <div style={{fontSize: (tall ? 24 : 13) * u, letterSpacing: '0.32em', textTransform: 'uppercase', color: accent, opacity: fade(4), whiteSpace: 'nowrap'}}>{kicker}</div> : null}
          {unit ? <div style={{fontSize: (tall ? 80 : 64) * u, fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1, color: accent, opacity: fade(after - 10), transform: `translateX(${(1 - fade(after - 10)) * -30 * u}px)`}}>{unit}</div> : null}
          <div style={{height: Math.max(2, 3 * u), width: (tall ? 150 : 90) * u, background: gold, transform: `scaleX(${rule})`, transformOrigin: tall ? '50% 50%' : '0 50%'}} />
          {label ? <div style={{fontSize: (tall ? 40 : 23) * u, fontWeight: 300, lineHeight: 1.3, color: dim, opacity: fade(after)}}>{label}</div> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
}
