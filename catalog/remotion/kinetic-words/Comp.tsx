// A Remotion composition (the same kind of component lessons 2 and 3 render to video). Here it plays inside a slide or a web page through @remotion/player.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export default function KineticWords({words = ['Video', 'Slides', 'Web'], gold = 2, ink = '#F6F3EC', accent = '#F2B45A'}: {words?: string[]; gold?: number; ink?: string; accent?: string}) {
  const frame = useCurrentFrame();
  const {fps, width: vw, height} = useVideoConfig();
  const tall = height > vw;
  const width = tall ? vw * 2.1 : vw;
  const per = 16;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: tall ? 'column' : 'row', gap: width * 0.035, fontFamily: '"Inter", -apple-system, "Helvetica Neue", "Segoe UI", sans-serif'}}>
      {words.map((w, i) => {
        const s = spring({frame: frame - 6 - i * per, fps, config: {damping: 14, stiffness: 130, mass: 0.7}});
        const o = interpolate(frame - 6 - i * per, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const line = interpolate(frame - 14 - i * per, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', opacity: o, transform: `translateY(${(1 - s) * 90}px) scale(${0.86 + 0.14 * s})`}}>
            <div style={{fontSize: width * 0.018, letterSpacing: '0.3em', color: accent, marginBottom: width * 0.008}}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{fontSize: width * 0.085, fontWeight: 200, letterSpacing: '-0.035em', color: i === gold ? accent : ink, lineHeight: 1}}>{w}</div>
            <div style={{height: 2, width: `${line * 100}%`, background: '#D6892A', marginTop: width * 0.012}} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
