import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop} from './slide';
import {FinalContent, TemplateContent} from './states';
import {EASE_OUT} from './theme';
import {Easing} from 'remotion';

// a gentler in-out than the UI curve — a hard ease makes the last corner drag on screen
const SWEEP = Easing.bezier(0.5, 0, 0.5, 1);

/**
 * Treatment 2 — Shimmer sweep.
 * One band of light crosses the slide on the same diagonal as the background gradient.
 * Everything behind the band is already rewritten; everything ahead of it is still template.
 * The band is the only thing that "does" the work, so the whole slide changes as one gesture.
 */

const ANGLE = 140; // matches the background gradient — title first, then footer, then picture
const BAND = 16; // width of the transition band, in gradient percent
const START = 30;
const END = 140;

export const Shimmer: React.FC = () => {
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

  const settle = interpolate(frame, [END - 6, END + 22], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT,
  });

  return (
    <AbsoluteFill>
      <Backdrop />

      <AbsoluteFill style={{maskImage: remaining, WebkitMaskImage: remaining}}>
        <TemplateContent />
      </AbsoluteFill>

      <AbsoluteFill style={{maskImage: revealed, WebkitMaskImage: revealed}}>
        <FinalContent frameGlow={settle * 0.8} />
      </AbsoluteFill>

      {/* the light itself */}
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
