import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, MosaicPhoto, PhotoFrame, SharpPhoto} from '../parts';
import {StaticLines} from '../text';
import {GREEN} from '../theme';
import {Bar, Field, SlideSpec, isField} from '../types';

/** One complete state of a slide, held still. Used by the sweep, which cross-masks two of them. */
export const StaticSlide: React.FC<{spec: SlideSpec; state: 'from' | 'to'}> = ({spec, state}) => (
  <AbsoluteFill>
    {spec.Chrome ? <spec.Chrome /> : null}
    {spec.order.map((n) =>
      isField(n) ? (
        <div key={n.id} style={{position: 'absolute', left: n.x, top: n[state].top, width: n.width, opacity: n[state].opacity}}>
          <StaticLines lines={n[state].lines} style={n.style} />
        </div>
      ) : (
        <div
          key={n.id}
          style={{
            position: 'absolute',
            left: (n as Bar).x,
            top: (n as Bar)[state].top,
            width: (n as Bar).width,
            height: (n as Bar).height,
            opacity: (n as Bar)[state].opacity,
            backgroundColor: GREEN,
          }}
        />
      )
    )}
    {spec.picture ? (
      <PhotoFrame pic={spec.picture}>
        {state === 'from' ? <MosaicPhoto pic={spec.picture} /> : <SharpPhoto pic={spec.picture} />}
      </PhotoFrame>
    ) : null}
  </AbsoluteFill>
);

export const SlideBackdrop = Backdrop;

export const fieldsOf = (spec: SlideSpec) => spec.order.filter(isField) as Field[];
