import React from 'react';
import {Composition, Sequence} from 'remotion';
import './fonts';
import {parallelPlan, sequentialPlan} from './schedule';
import {COVER} from './slides/cover';
import {OPPORTUNITY} from './slides/opportunity';
import {FPS, H, W} from './theme';
import {SlideSpec} from './types';
import {SHIMMER_TOTAL, Shimmer} from './treatments/Shimmer';
import {Stagger} from './treatments/Stagger';
import {Streamed} from './treatments/Streamed';

const SLIDES = [COVER, OPPORTUNITY];

/** id → component + length, so the reel and the compositions agree on both. */
const cuts = SLIDES.flatMap((spec) => {
  const par = parallelPlan(spec);
  const seq = sequentialPlan(spec);
  const name = spec.id === 'cover' ? 'Cover' : 'Opportunity';
  return [
    {id: `${name}-Stream`, total: par.total, C: () => <Streamed spec={spec} plan={par} />},
    {id: `${name}-Shimmer`, total: SHIMMER_TOTAL, C: () => <Shimmer spec={spec} />},
    {id: `${name}-Stagger`, total: par.total, C: () => <Stagger spec={spec} plan={par} />},
    {id: `${name}-Sequence`, total: seq.total, C: () => <Streamed spec={spec} plan={seq} />},
    {id: `${name}-Glow`, total: par.total, C: () => <Streamed spec={spec} plan={par} glow />},
  ];
});

// the reel runs treatment by treatment, cover then Opportunity, so the two slides sit together
const ORDER = ['Stream', 'Shimmer', 'Stagger', 'Sequence', 'Glow'];
const reelCuts = ORDER.flatMap((t) => cuts.filter((c) => c.id.endsWith(`-${t}`)));

const Reel: React.FC = () => {
  let at = 0;
  return (
    <>
      {reelCuts.map((c) => {
        const from = at;
        at += c.total;
        return (
          <Sequence key={c.id} from={from} durationInFrames={c.total}>
            <c.C />
          </Sequence>
        );
      })}
    </>
  );
};

const REEL_TOTAL = reelCuts.reduce((n, c) => n + c.total, 0);

export const RemotionRoot: React.FC = () => (
  <>
    {cuts.map((c) => (
      <Composition key={c.id} id={c.id} component={c.C} fps={FPS} width={W} height={H} durationInFrames={c.total} />
    ))}
    <Composition id="Reel" component={Reel} fps={FPS} width={W} height={H} durationInFrames={REEL_TOTAL} />
  </>
);

export const SPECS: SlideSpec[] = SLIDES;
