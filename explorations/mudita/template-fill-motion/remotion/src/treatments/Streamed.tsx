import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop, MosaicPhoto, PhotoFrame, ScanLine, SharpPhoto} from '../parts';
import {Plan} from '../schedule';
import {DissolveLines, StaticLines, TypedLines} from '../text';
import {EASE_IN_OUT, EASE_OUT, GREEN} from '../theme';
import {Bar, SlideSpec, changed, isField} from '../types';

/**
 * The streaming family. Placeholders evaporate, real copy is typed in behind a caret, and
 * the picture resolves under a scan line. The only differences between treatments 1, 4 and 5
 * are the plan they are handed and whether the typed characters glow as they land.
 */
export const Streamed: React.FC<{spec: SlideSpec; plan: Plan; glow?: boolean}> = ({spec, plan, glow}) => {
  const frame = useCurrentFrame();

  const settle = plan.picture
    ? interpolate(frame, [plan.picture.end, plan.picture.end + 26], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: EASE_OUT,
      })
    : 0;
  const scan = plan.picture
    ? interpolate(frame, [plan.picture.start, plan.picture.end], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: EASE_IN_OUT,
      })
    : 0;
  // in the sequenced plan the picture waits its turn, so its border comes up to say so
  const picWait = plan.picture && plan.picture.start > 90;
  const attention = picWait
    ? interpolate(
        frame,
        [plan.picture!.start - 12, plan.picture!.start, plan.picture!.end, plan.picture!.end + 26],
        [0, 0.5, 0.5, 0],
        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
      )
    : 0;

  return (
    <AbsoluteFill>
      <Backdrop spec={spec} />
      {spec.Chrome ? <spec.Chrome /> : null}

      {spec.order.map((node) => {
        const beat = plan.beats[node.id];
        const top = interpolate(frame, [beat.moveAt, beat.moveAt + 22], [node.from.top, node.to.top], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EASE_IN_OUT,
        });

        if (!isField(node)) {
          const bar = node as Bar;
          const opacity = interpolate(frame, [beat.inAt, beat.inAt + 16], [bar.from.opacity, bar.to.opacity], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: EASE_OUT,
          });
          const pulse = interpolate(frame, [beat.inAt, beat.inAt + 7, beat.inAt + 22], [0, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={bar.id}
              style={{
                position: 'absolute',
                left: bar.x,
                top,
                width: bar.width,
                height: bar.height,
                opacity,
                backgroundColor: GREEN,
                transform: `scaleX(${1 + 0.06 * pulse})`,
                transformOrigin: '0 50%',
                boxShadow: pulse > 0.01 ? `0 0 ${36 * pulse}px ${12 * pulse}px rgba(187,251,103,${0.55 * pulse})` : undefined,
              }}
            />
          );
        }

        const box: React.CSSProperties = {position: 'absolute', left: node.x, top, width: node.width};

        if (!changed(node)) {
          const opacity = interpolate(frame, [beat.inAt, beat.inAt + 18], [node.from.opacity, node.to.opacity], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: EASE_OUT,
          });
          return (
            <div key={node.id} style={{...box, opacity}}>
              <StaticLines lines={node.to.lines} style={node.style} />
            </div>
          );
        }

        const typedOpacity = interpolate(frame, [beat.inAt, beat.inAt + beat.inDur], [node.from.opacity, node.to.opacity], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EASE_OUT,
        });

        return (
          <div key={node.id} style={box}>
            {frame < beat.outAt + 44 ? (
              <div style={{position: 'absolute', left: 0, top: 0, opacity: node.from.opacity}}>
                <DissolveLines lines={node.from.lines} style={node.style} frame={frame} start={beat.outAt} />
              </div>
            ) : null}
            {frame >= beat.inAt ? (
              <div style={{position: 'absolute', left: 0, top: 0, opacity: typedOpacity}}>
                <TypedLines
                  lines={node.to.lines}
                  style={node.style}
                  frame={frame}
                  start={beat.inAt}
                  dur={beat.inDur}
                  caretH={node.caretH}
                  glow={glow}
                />
              </div>
            ) : null}
          </div>
        );
      })}

      {spec.picture && plan.picture ? (
        <PhotoFrame pic={spec.picture} glow={Math.max(attention, settle * 0.7)}>
          <MosaicPhoto pic={spec.picture} />
          <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 ${100 - scan * 100}% 0)`}}>
            <SharpPhoto pic={spec.picture} />
          </div>
          {scan > 0 && scan < 1 ? <ScanLine y={scan * spec.picture.h} /> : null}
        </PhotoFrame>
      ) : null}
    </AbsoluteFill>
  );
};
