import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Backdrop, FooterBlock, MosaicPhoto, PhotoFrame, footStyle, titleStyle} from './slide';
import {EASE_IN, EASE_OUT, EASE_IN_OUT, FINAL, GREEN, L, MOSAIC_COLS, MOSAIC_ROWS, Seg, TEMPLATE, hash01} from './theme';

/**
 * Treatment 3 — Stagger swap.
 * Copy is replaced a word at a time and the picture assembles tile by tile, so the slide
 * reads as being built rather than crossfaded. This is the "you can watch it think" version.
 */

type Token = {t: string; c: string; space: boolean};

const tokenise = (segs: Seg[]): Token[] => {
  const out: Token[] = [];
  segs.forEach((s) => {
    s.t.split(/(\s+)/).forEach((part) => {
      if (part === '') return;
      out.push({t: part, c: s.c, space: /^\s+$/.test(part)});
    });
  });
  return out;
};

const WordsOut: React.FC<{lines: Seg[][]; frame: number; start: number; style: React.CSSProperties; opacity: number}> = ({
  lines,
  frame,
  start,
  style,
  opacity,
}) => {
  let n = 0;
  return (
    <div style={{opacity}}>
      {lines.map((line, li) => (
        <div key={li} style={{...style, whiteSpace: 'pre'}}>
          {tokenise(line).map((tk, i) => {
            if (tk.space) return <span key={i} style={{whiteSpace: 'pre'}}>{tk.t}</span>;
            const from = start + n * 2.5;
            n += 1;
            const p = interpolate(frame, [from, from + 12], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: EASE_IN,
            });
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  color: tk.c,
                  whiteSpace: 'pre',
                  opacity: 1 - p,
                  filter: `blur(${p * 9}px)`,
                  transform: `translateY(${-10 * p}px) scale(${1 - 0.08 * p})`,
                }}
              >
                {tk.t}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const WordsIn: React.FC<{lines: Seg[][]; frame: number; start: number; style: React.CSSProperties; opacity: number}> = ({
  lines,
  frame,
  start,
  style,
  opacity,
}) => {
  let n = 0;
  return (
    <div style={{opacity}}>
      {lines.map((line, li) => (
        <div key={li} style={{...style, whiteSpace: 'pre'}}>
          {tokenise(line).map((tk, i) => {
            if (tk.space) return <span key={i} style={{whiteSpace: 'pre'}}>{tk.t}</span>;
            const from = start + n * 4;
            n += 1;
            const p = interpolate(frame, [from, from + 22], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: EASE_OUT,
            });
            const flash = interpolate(frame, [from, from + 6, from + 20], [0, 1, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  color: tk.c,
                  whiteSpace: 'pre',
                  opacity: p,
                  filter: `blur(${(1 - p) * 10}px)`,
                  transform: `translateY(${26 * (1 - p)}px) scale(${0.94 + 0.06 * p})`,
                  textShadow: flash > 0.01 ? `0 0 ${26 * flash}px rgba(187,251,103,${0.9 * flash})` : undefined,
                }}
              >
                {tk.t}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// --- picture: 16 x 23 tiles resolving out of the mosaic ---------------------
const COLS = MOSAIC_COLS;
const ROWS = MOSAIC_ROWS;
const TILE_START = 46;
const TILE_SPREAD = 74;
const TILE_RISE = 10;

const Tiles: React.FC<{frame: number}> = ({frame}) => {
  const tw = L.photo.w / COLS;
  const th = L.photo.h / ROWS;
  const tiles: React.ReactNode[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      const dx = (c + 0.5) / COLS - 0.5;
      const dy = (r + 0.5) / ROWS - 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy) / 0.707;
      const order = 0.55 * dist + 0.45 * hash01(i);
      const from = TILE_START + order * TILE_SPREAD;
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
            backgroundImage: `url(${staticFile('photo.jpg')})`,
            backgroundSize: `${L.photo.w}px ${L.photo.h}px`,
            backgroundPosition: `${-c * tw}px ${-r * th}px`,
          }}
        >
          {flash > 0.01 ? (
            <div style={{position: 'absolute', inset: 0, backgroundColor: GREEN, opacity: 0.5 * flash}} />
          ) : null}
        </div>
      );
    }
  }
  return <div style={{position: 'absolute', left: 0, top: L.photo.top, width: L.photo.w, height: L.photo.h}}>{tiles}</div>;
};

export const Stagger: React.FC = () => {
  const frame = useCurrentFrame();

  const reflow = interpolate(frame, [52, 74], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_IN_OUT,
  });
  const blockTop = interpolate(reflow, [0, 1], [L.titleTopTemplate, L.titleTopFinal]);
  const titleH = interpolate(reflow, [0, 1], [L.titleLine * 2, L.titleLine]);

  const subOpacity = interpolate(frame, [86, 110], [TEMPLATE.bodyOpacity, FINAL.bodyOpacity], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT,
  });

  const gridFade = interpolate(frame, [TILE_START - 8, TILE_START + 26], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const settle = interpolate(frame, [TILE_START + TILE_SPREAD, TILE_START + TILE_SPREAD + 30], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT,
  });

  return (
    <AbsoluteFill>
      <Backdrop />

      <div
        style={{
          position: 'absolute',
          left: L.textX,
          top: blockTop,
          width: L.blockW,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: L.gap,
        }}
      >
        <div style={{height: titleH, width: '100%', position: 'relative'}}>
          {frame < 72 ? (
            <div style={{position: 'absolute', left: 0, top: 0}}>
              <WordsOut lines={TEMPLATE.titleLines} frame={frame} start={30} style={titleStyle} opacity={TEMPLATE.titleOpacity} />
            </div>
          ) : null}
          {frame >= 66 ? (
            <div style={{position: 'absolute', left: 0, top: 0}}>
              <WordsIn lines={FINAL.titleLines} frame={frame} start={68} style={titleStyle} opacity={1} />
            </div>
          ) : null}
        </div>
        <div
          style={{
            width: L.dividerW,
            height: L.dividerH,
            backgroundColor: GREEN,
            boxShadow: `0 0 ${40 * reflow * (1 - reflow) * 4}px rgba(187,251,103,0.6)`,
          }}
        />
        <div
          style={{
            fontFamily: titleStyle.fontFamily,
            fontSize: L.subSize,
            lineHeight: `${L.subLine}px`,
            color: '#fff',
            opacity: subOpacity,
          }}
        >
          {FINAL.subtitle}
        </div>
      </div>

      <FooterBlock opacity={1}>
        {frame < 108 ? (
          <div style={{position: 'absolute', left: 0, top: 0}}>
            <WordsOut lines={TEMPLATE.footLines} frame={frame} start={54} style={footStyle} opacity={TEMPLATE.bodyOpacity} />
          </div>
        ) : null}
        {frame >= 96 ? (
          <div style={{position: 'absolute', left: 0, top: 0}}>
            <WordsIn lines={FINAL.footLines} frame={frame} start={98} style={footStyle} opacity={FINAL.bodyOpacity} />
          </div>
        ) : null}
      </FooterBlock>

      <PhotoFrame glow={settle * 0.7}>
        <MosaicPhoto grid={gridFade} wash={1} />
        <Tiles frame={frame} />
      </PhotoFrame>
    </AbsoluteFill>
  );
};
