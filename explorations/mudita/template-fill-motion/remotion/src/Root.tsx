import React from 'react';
import {Composition, Sequence} from 'remotion';
import './fonts';
import {Stream} from './Stream';
import {Shimmer} from './Shimmer';
import {Stagger} from './Stagger';
import {StreamSequence} from './StreamSequence';
import {DURATION, DURATION_SEQ, FPS, H, W} from './theme';

const Reel: React.FC = () => (
  <>
    <Sequence durationInFrames={DURATION}>
      <Stream />
    </Sequence>
    <Sequence from={DURATION} durationInFrames={DURATION}>
      <Shimmer />
    </Sequence>
    <Sequence from={DURATION * 2} durationInFrames={DURATION}>
      <Stagger />
    </Sequence>
    <Sequence from={DURATION * 3} durationInFrames={DURATION_SEQ}>
      <StreamSequence />
    </Sequence>
  </>
);

export const RemotionRoot: React.FC = () => {
  const base = {fps: FPS, width: W, height: H, durationInFrames: DURATION};
  return (
    <>
      <Composition id="Stream" component={Stream} {...base} />
      <Composition id="Shimmer" component={Shimmer} {...base} />
      <Composition id="Stagger" component={Stagger} {...base} />
      <Composition id="StreamSequence" component={StreamSequence} {...base} durationInFrames={DURATION_SEQ} />
      <Composition id="Reel" component={Reel} {...base} durationInFrames={DURATION * 3 + DURATION_SEQ} />
    </>
  );
};
