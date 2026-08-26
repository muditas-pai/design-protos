import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {GREEN} from './theme';
import {Picture, SlideSpec} from './types';

/** The leaf photograph plus the colour-blend gradient. Same source on both slides, cropped differently. */
export const Backdrop: React.FC<{spec: SlideSpec}> = ({spec}) => (
  <AbsoluteFill style={{backgroundColor: '#000', isolation: 'isolate'}}>
    <Img
      src={staticFile('cover-bg.png')}
      style={{position: 'absolute', ...spec.backdrop, objectFit: 'cover'}}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(139.885deg, #bbfb67 29.982%, #6dfac2 66.206%)',
        mixBlendMode: 'color',
      }}
    />
  </AbsoluteFill>
);

export const PhotoFrame: React.FC<{pic: Picture; children: React.ReactNode; glow?: number}> = ({
  pic,
  children,
  glow = 0,
}) => (
  <div
    style={{
      position: 'absolute',
      left: pic.x,
      top: pic.y,
      width: pic.w,
      height: pic.h,
      border: `${pic.border}px solid rgba(187,251,103,${0.5 + 0.5 * glow})`,
      borderRadius: pic.radius,
      boxSizing: 'border-box',
      boxShadow: glow > 0 ? `0 0 ${60 * glow}px rgba(187,251,103,${0.35 * glow})` : undefined,
    }}
  >
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: pic.radius}}>{children}</div>
  </div>
);

export const SharpPhoto: React.FC<{pic: Picture}> = ({pic}) => (
  <Img
    src={staticFile(pic.src)}
    style={{position: 'absolute', left: 0, top: pic.photo.top, width: pic.photo.w, height: pic.photo.h}}
  />
);

/**
 * The picture placeholder: a pre-downscaled copy of the photograph blown back up with
 * nearest-neighbour, muted, with the template's green grid over it.
 */
export const MosaicPhoto: React.FC<{pic: Picture; grid?: number; wash?: number}> = ({pic, grid = 1, wash = 1}) => {
  const cellW = pic.photo.w / pic.cols;
  const cellH = pic.photo.h / pic.rows;
  return (
    <div style={{position: 'absolute', left: 0, top: pic.photo.top, width: pic.photo.w, height: pic.photo.h}}>
      <Img
        src={staticFile(pic.mosaicSrc)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
          filter: `saturate(${1 - 0.3 * wash}) brightness(${1 - 0.16 * wash})`,
        }}
      />
      {wash > 0 ? (
        <div style={{position: 'absolute', inset: 0, backgroundColor: `rgba(187,251,103,${0.1 * wash})`}} />
      ) : null}
      {grid > 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `repeating-linear-gradient(to right, rgba(187,251,103,${0.55 * grid}) 0 2px, transparent 2px ${cellW}px), repeating-linear-gradient(to bottom, rgba(187,251,103,${0.55 * grid}) 0 2px, transparent 2px ${cellH}px)`,
          }}
        />
      ) : null}
    </div>
  );
};

/** The scan line used by both streaming treatments. */
export const ScanLine: React.FC<{y: number}> = ({y}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y - 60,
        height: 60,
        background: 'linear-gradient(to bottom, rgba(187,251,103,0) 0%, rgba(187,251,103,0.28) 100%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y - 2,
        height: 4,
        backgroundColor: GREEN,
        boxShadow: '0 0 26px 6px rgba(187,251,103,0.75)',
      }}
    />
  </>
);
