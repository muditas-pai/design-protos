import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop} from '../parts';
import {SlideSpec} from '../types';
import {StaticSlide} from './common';

/**
 * Treatment 2 — Shimmer sweep.
 * One band of light crosses the slide on the background gradient's own diagonal. Behind the
 * band everything is already rewritten, ahead of it everything is still template. It works on
 * any layout because it never looks at what is underneath it.
 */

const ANGLE = 140;
const BAND = 16;
export const SHIMMER_TOTAL = 210;
const START = 30;
const END = 140;

// a gentler in-out than the UI curve — a hard ease makes the last corner drag on screen
const SWEEP = Easing.bezier(0.5, 0, 0.5, 1);

export const Shimmer: React.FC<{spec: SlideSpec}> = ({spec}) => {
  const frame = useCurrentFrame();

  const p = interpolate(frame, [START, END], [-BAND, 100 + BAND], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: SWEEP,
  });

  const revealed = `linear-gradient(${ANGLE}deg, #000 ${p}%, rgba(0,0,0,0) ${p + BAND}%)`;
  const remaining = `linear-gradient(${ANGLE}deg, rgba(0,0,0,0) ${p}%, #000 ${p + BAND}%)`;

  const bandOpacity = interpolate(frame, [START, START + 10, END - 12, END], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Backdrop spec={spec} />

      <AbsoluteFill style={{maskImage: remaining, WebkitMaskImage: remaining}}>
        <StaticSlide spec={spec} state="from" />
      </AbsoluteFill>

      <AbsoluteFill style={{maskImage: revealed, WebkitMaskImage: revealed}}>
        <StaticSlide spec={spec} state="to" />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          opacity: bandOpacity,
          mixBlendMode: 'screen',
          backgroundImage: `linear-gradient(${ANGLE}deg,
            rgba(187,251,103,0) ${p - 4}%,
            rgba(187,251,103,0.10) ${p + BAND * 0.32}%,
            rgba(220,255,190,0.55) ${p + BAND * 0.55}%,
            rgba(109,250,200,0.14) ${p + BAND * 0.8}%,
            rgba(109,250,200,0) ${p + BAND + 6}%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: bandOpacity * 0.55,
          mixBlendMode: 'screen',
          filter: 'blur(40px)',
          backgroundImage: `linear-gradient(${ANGLE}deg,
            rgba(187,251,103,0) ${p + BAND * 0.3}%,
            rgba(187,251,103,0.5) ${p + BAND * 0.55}%,
            rgba(187,251,103,0) ${p + BAND * 0.85}%)`,
        }}
      />
    </AbsoluteFill>
  );
};
