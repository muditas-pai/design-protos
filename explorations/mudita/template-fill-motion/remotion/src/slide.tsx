import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {FONT, GREEN, L, MOSAIC_COLS, MOSAIC_ROWS, Seg} from './theme';

/** The leaf photograph plus the colour-blend gradient — identical on both slides, never animates. */
export const Backdrop: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000', isolation: 'isolate'}}>
    <Img
      src={staticFile('cover-bg.png')}
      style={{position: 'absolute', left: 0, top: -375, width: 2438, height: 1625, objectFit: 'cover'}}
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

export const Segments: React.FC<{segs: Seg[]}> = ({segs}) => (
  <>
    {segs.map((s, i) => (
      <span key={i} style={{color: s.c, whiteSpace: 'pre'}}>
        {s.t}
      </span>
    ))}
  </>
);

export const titleStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: L.titleSize,
  lineHeight: `${L.titleLine}px`,
  letterSpacing: L.tracking,
  color: '#fff',
  margin: 0,
  whiteSpace: 'pre',
};

export const subStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: L.subSize,
  lineHeight: `${L.subLine}px`,
  color: '#fff',
  margin: 0,
};

export const footStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: L.footSize,
  lineHeight: `${L.footLine}px`,
  color: '#fff',
  margin: 0,
  whiteSpace: 'pre',
};

/**
 * Title + rule + subtitle. `top` and `titleHeight` are driven by the treatment so the
 * rule and subtitle reflow upward as the two-line placeholder collapses to one real line.
 */
export const TextBlock: React.FC<{
  top: number;
  titleHeight: number;
  children: React.ReactNode;
  subtitle: React.ReactNode;
  subOpacity: number;
  dividerGlow?: number;
}> = ({top, titleHeight, children, subtitle, subOpacity, dividerGlow = 0}) => (
  <div
    style={{
      position: 'absolute',
      left: L.textX,
      top,
      width: L.blockW,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: L.gap,
    }}
  >
    <div style={{height: titleHeight, width: '100%', position: 'relative'}}>{children}</div>
    <div
      style={{
        width: L.dividerW,
        height: L.dividerH,
        backgroundColor: GREEN,
        boxShadow: dividerGlow > 0 ? `0 0 ${28 * dividerGlow}px ${10 * dividerGlow}px rgba(187,251,103,${0.5 * dividerGlow})` : undefined,
      }}
    />
    <div style={{...subStyle, opacity: subOpacity}}>{subtitle}</div>
  </div>
);

export const FooterBlock: React.FC<{opacity: number; children: React.ReactNode}> = ({opacity, children}) => (
  <div style={{position: 'absolute', left: L.footX, top: L.footY, width: 920, opacity}}>{children}</div>
);

/** The rounded frame the picture sits in — border and clipping are shared by every state. */
export const PhotoFrame: React.FC<{children: React.ReactNode; glow?: number}> = ({children, glow = 0}) => (
  <div
    style={{
      position: 'absolute',
      left: L.img.x,
      top: L.img.y,
      width: L.img.w,
      height: L.img.h,
      border: `${L.img.border}px solid rgba(187,251,103,${0.5 + 0.5 * glow})`,
      borderRadius: L.img.radius,
      boxSizing: 'border-box',
      boxShadow: glow > 0 ? `0 0 ${60 * glow}px rgba(187,251,103,${0.35 * glow})` : undefined,
    }}
  >
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: L.img.radius}}>{children}</div>
  </div>
);

/** The real photograph at Figma's exact crop. */
export const SharpPhoto: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <Img
    src={staticFile('photo.jpg')}
    style={{
      position: 'absolute',
      left: 0,
      top: L.photo.top,
      width: L.photo.w,
      height: L.photo.h,
      ...style,
    }}
  />
);

/**
 * The template's picture placeholder: the same photograph knocked back to a coarse
 * mosaic with a green grid drawn over it. `block` drives the resolve.
 */
export const MosaicPhoto: React.FC<{grid: number; wash?: number}> = ({grid, wash = 1}) => {
  const cellW = L.photo.w / MOSAIC_COLS;
  const cellH = L.photo.h / MOSAIC_ROWS;
  return (
    <div style={{position: 'absolute', left: 0, top: L.photo.top, width: L.photo.w, height: L.photo.h}}>
      {/* pre-downscaled 16x23 source, blown back up with nearest-neighbour */}
      <Img
        src={staticFile('photo-mosaic.png')}
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
        <div style={{position: 'absolute', inset: 0, backgroundColor: `rgba(187,251,103,${0.10 * wash})`}} />
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
