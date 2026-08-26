import React from 'react';
import {interpolate} from 'remotion';
import {EASE_IN, GREEN, Seg} from './theme';

/** The writing caret. Shared by both streaming treatments. */
export const Caret: React.FC<{h: number; opacity: number}> = ({h, opacity}) => (
  <span
    style={{
      display: 'inline-block',
      width: 3,
      height: h,
      marginLeft: 6,
      backgroundColor: GREEN,
      boxShadow: `0 0 12px rgba(187,251,103,0.9)`,
      transform: `translateY(${h * 0.12}px)`,
      opacity,
      verticalAlign: 'baseline',
    }}
  />
);

/** Placeholder text leaving: last character first, lifted and blurred out. */
export const DissolveLine: React.FC<{
  segs: Seg[];
  frame: number;
  start: number;
  style: React.CSSProperties;
  speed?: number;
}> = ({segs, frame, start, style, speed = 0.55}) => {
  const chars: {ch: string; c: string}[] = [];
  segs.forEach((s) => s.t.split('').forEach((ch) => chars.push({ch, c: s.c})));
  return (
    <div style={{...style, whiteSpace: 'pre'}}>
      {chars.map((c, i) => {
        const from = start + (chars.length - 1 - i) * speed;
        const p = interpolate(frame, [from, from + 11], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EASE_IN,
        });
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              color: c.c,
              opacity: 1 - p,
              filter: `blur(${p * 7}px)`,
              transform: `translateY(${-14 * p}px)`,
              whiteSpace: 'pre',
            }}
          >
            {c.ch}
          </span>
        );
      })}
    </div>
  );
};
