import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Backdrop, MosaicPhoto, PhotoFrame} from '../parts';
import {Plan} from '../schedule';
import {StaticLines, WordsIn, WordsOut} from '../text';
import {EASE_IN_OUT, EASE_OUT, GREEN, hash01} from '../theme';
import {Bar, Picture, SlideSpec, changed, isField} from '../types';

/**
 * Treatment 3 — Stagger swap.
 * Word by word, and on the cover tile by tile: the slide reads as being built rather than
 * crossfaded. On a slide with no picture it is purely the word swap.
 */

const TILE_RISE = 10;

const Tiles: React.FC<{pic: Picture; frame: number; start: number; spread: number}> = ({pic, frame, start, spread}) => {
  const tw = pic.photo.w / pic.cols;
  const th = pic.photo.h / pic.rows;
  const tiles: React.ReactNode[] = [];
  for (let r = 0; r < pic.rows; r++) {
    for (let c = 0; c < pic.cols; c++) {
      const i = r * pic.cols + c;
      const dx = (c + 0.5) / pic.cols - 0.5;
      const dy = (r + 0.5) / pic.rows - 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy) / 0.707;
      const from = start + (0.55 * dist + 0.45 * hash01(i)) * spread;
      const p = interpolate(frame, [from, from + TILE_RISE], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: EASE_OUT,
      });
      if (p <= 0) continue;
      const flash = interpolate(frame, [from, from + 3, from + TILE_RISE + 4], [0, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      tiles.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            left: c * tw,
            top: r * th,
            width: tw + 0.5,
            height: th + 0.5,
            opacity: p,
            backgroundImage: `url(${staticFile(pic.src)})`,
            backgroundSize: `${pic.photo.w}px ${pic.photo.h}px`,
            backgroundPosition: `${-c * tw}px ${-r * th}px`,
          }}
        >
          {flash > 0.01 ? <div style={{position: 'absolute', inset: 0, backgroundColor: GREEN, opacity: 0.5 * flash}} /> : null}
        </div>
      );
    }
  }
  return <div style={{position: 'absolute', left: 0, top: pic.photo.top, width: pic.photo.w, height: pic.photo.h}}>{tiles}</div>;
};

export const Stagger: React.FC<{spec: SlideSpec; plan: Plan}> = ({spec, plan}) => {
  const frame = useCurrentFrame();
  const picStart = plan.picture ? plan.picture.start + 6 : 0;
  const picSpread = plan.picture ? plan.picture.end - plan.picture.start - TILE_RISE : 0;
  const settle = plan.picture
    ? interpolate(frame, [plan.picture.end, plan.picture.end + 30], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: EASE_OUT,
      })
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

        return (
          <div key={node.id} style={box}>
            {frame < beat.inAt + 6 ? (
              <div style={{position: 'absolute', left: 0, top: 0, opacity: node.from.opacity}}>
                <WordsOut lines={node.from.lines} style={node.style} frame={frame} start={beat.outAt} />
              </div>
            ) : null}
            {frame >= beat.inAt - 4 ? (
              <div style={{position: 'absolute', left: 0, top: 0, opacity: node.to.opacity}}>
                <WordsIn lines={node.to.lines} style={node.style} frame={frame} start={beat.inAt} />
              </div>
            ) : null}
          </div>
        );
      })}

      {spec.picture && plan.picture ? (
        <PhotoFrame pic={spec.picture} glow={settle * 0.7}>
          <MosaicPhoto pic={spec.picture} />
          <Tiles pic={spec.picture} frame={frame} start={picStart} spread={picSpread} />
        </PhotoFrame>
      ) : null}
    </AbsoluteFill>
  );
};
