import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop, FooterBlock, MosaicPhoto, PhotoFrame, Segments, SharpPhoto, footStyle, titleStyle} from './slide';
import {EASE_IN_OUT, EASE_OUT, FINAL, GREEN, L, TEMPLATE, segLen, sliceSegs} from './theme';
import {Caret, DissolveLine} from './typewriter';

/**
 * Treatment 4 — Stream, in sequence.
 * Same mechanics as treatment 1, but nothing overlaps: the title is finished before the rule
 * and subtitle are touched, those are finished before the footer starts, and the picture is
 * last. The order is carried by the caret and the scan line alone — whatever is not its turn
 * yet simply sits at its template opacity.
 */

const T = {
  titleOut: 20,
  reflow: [34, 50] as const,
  type: [50, 92] as const,
  caretOut: [92, 102] as const,
  ruleBeat: [102, 118] as const,
  footOut: 118,
  footType: [130, 176] as const,
  footLift: [166, 184] as const,
  scan: [190, 272] as const,
  settle: [272, 298] as const,
};

export const StreamSequence: React.FC = () => {
  const frame = useCurrentFrame();

  // --- 1. title ----------------------------------------------------------
  const reflow = interpolate(frame, [T.reflow[0], T.reflow[1]], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_IN_OUT,
  });
  const blockTop = interpolate(reflow, [0, 1], [L.titleTopTemplate, L.titleTopFinal]);
  const titleH = interpolate(reflow, [0, 1], [L.titleLine * 2, L.titleLine]);

  const titleSegs = FINAL.titleLines[0];
  const typed = Math.round(
    interpolate(frame, [T.type[0], T.type[1]], [0, segLen(titleSegs)], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: EASE_OUT,
    })
  );
  const titleCaret = interpolate(frame, [T.caretOut[0], T.caretOut[1]], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // --- 2. rule + subtitle ------------------------------------------------
  const ruleBeat = interpolate(frame, [T.ruleBeat[0], T.ruleBeat[0] + 7, T.ruleBeat[1]], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subOpacity = interpolate(frame, [T.ruleBeat[0] + 2, T.ruleBeat[1]], [TEMPLATE.bodyOpacity, FINAL.bodyOpacity], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT,
  });

  // --- 3. footer ---------------------------------------------------------
  const footChars = FINAL.footLines.map(segLen);
  const footTyped = Math.round(
    interpolate(frame, [T.footType[0], T.footType[1]], [0, footChars[0] + footChars[1]], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: EASE_OUT,
    })
  );
  const foot0 = Math.min(footChars[0], footTyped);
  const foot1 = Math.max(0, footTyped - footChars[0]);
  const footCaretOn = frame >= T.footType[0] && frame <= T.footType[1] + 4;
  const footOpacity = interpolate(frame, [T.footLift[0], T.footLift[1]], [TEMPLATE.bodyOpacity, FINAL.bodyOpacity], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT,
  });

  // --- 4. picture --------------------------------------------------------
  const scan = interpolate(frame, [T.scan[0], T.scan[1]], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_IN_OUT,
  });
  const scanY = scan * L.img.h;
  const settle = interpolate(frame, [T.settle[0], T.settle[1]], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT,
  });
  // the picture's turn is signalled by its own border coming up
  const picAttention = interpolate(frame, [T.scan[0] - 10, T.scan[0], T.scan[1], T.settle[1]], [0, 0.5, 0.5, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
          {frame < T.titleOut + 40 ? (
            <div style={{position: 'absolute', left: 0, top: 0, opacity: TEMPLATE.titleOpacity}}>
              {TEMPLATE.titleLines.map((line, i) => (
                <DissolveLine key={i} segs={line} frame={frame} start={T.titleOut + i * 5} style={titleStyle} />
              ))}
            </div>
          ) : null}
          {frame >= T.type[0] ? (
            <div style={{position: 'absolute', left: 0, top: 0, ...titleStyle}}>
              <Segments segs={sliceSegs(titleSegs, typed)} />
              {titleCaret > 0 ? <Caret h={78} opacity={titleCaret} /> : null}
            </div>
          ) : null}
        </div>
        <div
          style={{
            width: L.dividerW,
            height: L.dividerH,
            backgroundColor: GREEN,
            transform: `scaleX(${1 + 0.06 * ruleBeat})`,
            transformOrigin: '0 50%',
            boxShadow: `0 0 ${36 * ruleBeat}px ${12 * ruleBeat}px rgba(187,251,103,${0.55 * ruleBeat})`,
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
        {frame < T.footOut + 40 ? (
          <div style={{position: 'absolute', left: 0, top: 0, opacity: TEMPLATE.bodyOpacity}}>
            {TEMPLATE.footLines.map((line, i) => (
              <DissolveLine key={i} segs={line} frame={frame} start={T.footOut + i * 4} style={footStyle} />
            ))}
          </div>
        ) : null}
        {frame >= T.footType[0] ? (
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

      {/* picture, last */}
      <PhotoFrame glow={Math.max(picAttention, settle * 0.7)}>
        <MosaicPhoto grid={1} wash={1} />
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
