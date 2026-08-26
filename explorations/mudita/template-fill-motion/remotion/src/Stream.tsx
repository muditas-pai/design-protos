import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {
  Backdrop,
  FooterBlock,
  MosaicPhoto,
  PhotoFrame,
  Segments,
  SharpPhoto,
  footStyle,
  titleStyle,
} from './slide';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, FINAL, GREEN, L, TEMPLATE, segLen, sliceSegs} from './theme';

/**
 * Treatment 1 — Stream.
 * The placeholders evaporate upward, the block reflows, and the real copy is typed in
 * behind a caret while a scan line resolves the picture from the top down.
 */

const Caret: React.FC<{h: number; opacity: number}> = ({h, opacity}) => (
  <span
    style={{
      display: 'inline-block',
      width: 3,
      height: h,
      marginLeft: 6,
      backgroundColor: GREEN,
      boxShadow: `0 0 12px rgba(187,251,103,0.9)`,
      transform: `translateY(${h * 0.12}px)`,
      opacity,
      verticalAlign: 'baseline',
    }}
  />
);

/** Placeholder text leaving: last word first, lifted and blurred out. */
const DissolveLine: React.FC<{
  segs: {t: string; c: string}[];
  frame: number;
  start: number;
  style: React.CSSProperties;
}> = ({segs, frame, start, style}) => {
  const chars: {ch: string; c: string}[] = [];
  segs.forEach((s) => s.t.split('').forEach((ch) => chars.push({ch, c: s.c})));
  return (
    <div style={{...style, whiteSpace: 'pre'}}>
      {chars.map((c, i) => {
        const from = start + (chars.length - 1 - i) * 0.55;
        const p = interpolate(frame, [from, from + 11], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EASE_IN,
        });
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              color: c.c,
              opacity: 1 - p,
              filter: `blur(${p * 7}px)`,
              transform: `translateY(${-14 * p}px)`,
              whiteSpace: 'pre',
            }}
          >
            {c.ch}
          </span>
        );
      })}
    </div>
  );
};

export const Stream: React.FC = () => {
  const frame = useCurrentFrame();

  // --- title -------------------------------------------------------------
  const titleOut = 30;
  const reflow = interpolate(frame, [46, 66], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_IN_OUT,
  });
  const blockTop = interpolate(reflow, [0, 1], [L.titleTopTemplate, L.titleTopFinal]);
  const titleH = interpolate(reflow, [0, 1], [L.titleLine * 2, L.titleLine]);

  const titleSegs = FINAL.titleLines[0];
  const titleChars = segLen(titleSegs);
  const typeStart = 60;
  const typeEnd = 108;
  const typed = Math.round(
    interpolate(frame, [typeStart, typeEnd], [0, titleChars], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: EASE_OUT,
    })
  );

  // --- footer ------------------------------------------------------------
  const footOut = 56;
  const footChars = FINAL.footLines.map(segLen);
  const footTotal = footChars[0] + footChars[1];
  const footTyped = Math.round(
    interpolate(frame, [84, 148], [0, footTotal], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: EASE_OUT,
    })
  );
  const foot0 = Math.min(footChars[0], footTyped);
  const foot1 = Math.max(0, footTyped - footChars[0]);

  const subOpacity = interpolate(frame, [96, 118], [TEMPLATE.bodyOpacity, FINAL.bodyOpacity], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT,
  });
  const footOpacity = interpolate(frame, [130, 152], [TEMPLATE.bodyOpacity, FINAL.bodyOpacity], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT,
  });

  // --- picture -----------------------------------------------------------
  const scan = interpolate(frame, [40, 142], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_IN_OUT,
  });
  const scanY = scan * L.img.h;
  const gridFade = interpolate(frame, [40, 100], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const settle = interpolate(frame, [142, 168], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});

  const caretAlive = frame >= typeStart && frame <= typeEnd + 6;
  const caretOpacity = interpolate(frame, [typeEnd + 6, typeEnd + 16], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const footCaretOn = frame >= 84 && frame <= 156;

  return (
    <AbsoluteFill>
      <Backdrop />

      {/* title / rule / subtitle */}
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
          {frame < titleOut + 40 ? (
            <div style={{position: 'absolute', left: 0, top: 0, opacity: TEMPLATE.titleOpacity}}>
              {TEMPLATE.titleLines.map((line, i) => (
                <DissolveLine key={i} segs={line} frame={frame} start={titleOut + i * 5} style={titleStyle} />
              ))}
            </div>
          ) : null}
          {frame >= typeStart ? (
            <div style={{position: 'absolute', left: 0, top: 0, ...titleStyle}}>
              <Segments segs={sliceSegs(titleSegs, typed)} />
              {caretAlive || caretOpacity > 0 ? (
                <Caret h={78} opacity={frame <= typeEnd + 6 ? 1 : caretOpacity} />
              ) : null}
            </div>
          ) : null}
        </div>
        <div
          style={{
            width: L.dividerW,
            height: L.dividerH,
            backgroundColor: GREEN,
            boxShadow: `0 0 ${34 * (1 - reflow) * reflow * 4}px rgba(187,251,103,0.6)`,
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

      {/* footer */}
      <FooterBlock opacity={1}>
        {frame < footOut + 40 ? (
          <div style={{position: 'absolute', left: 0, top: 0, opacity: TEMPLATE.bodyOpacity}}>
            {TEMPLATE.footLines.map((line, i) => (
              <DissolveLine key={i} segs={line} frame={frame} start={footOut + i * 4} style={footStyle} />
            ))}
          </div>
        ) : null}
        {frame >= 84 ? (
          <div style={{position: 'absolute', left: 0, top: 0, opacity: footOpacity}}>
            <div style={footStyle}>
              <Segments segs={sliceSegs(FINAL.footLines[0], foot0)} />
              {footCaretOn && foot1 === 0 ? <Caret h={22} opacity={1} /> : null}
            </div>
            <div style={footStyle}>
              <Segments segs={sliceSegs(FINAL.footLines[1], foot1)} />
              {footCaretOn && foot1 > 0 ? <Caret h={22} opacity={1} /> : null}
            </div>
          </div>
        ) : null}
      </FooterBlock>

      {/* picture: a scan line resolves the mosaic from the top down */}
      <PhotoFrame glow={settle * 0.7}>
        <MosaicPhoto grid={gridFade} wash={gridFade} />
        <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 ${100 - scan * 100}% 0)`}}>
          <SharpPhoto />
        </div>
        {scan > 0 && scan < 1 ? (
          <>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: scanY - 60,
                height: 60,
                background: 'linear-gradient(to bottom, rgba(187,251,103,0) 0%, rgba(187,251,103,0.28) 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: scanY - 2,
                height: 4,
                backgroundColor: GREEN,
                boxShadow: '0 0 26px 6px rgba(187,251,103,0.75)',
              }}
            />
          </>
        ) : null}
      </PhotoFrame>
    </AbsoluteFill>
  );
};
