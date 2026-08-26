import React from 'react';
import {interpolate} from 'remotion';
import {EASE_IN, EASE_OUT, GREEN} from './theme';
import {Line, Seg, lineOffsets, linesLen, sliceLines} from './types';

export const Segments: React.FC<{segs: Seg[]}> = ({segs}) => (
  <>
    {segs.map((s, i) => (
      <span key={i} style={{color: s.c, whiteSpace: 'pre'}}>
        {s.t}
      </span>
    ))}
  </>
);

export const StaticLines: React.FC<{lines: Line[]; style: React.CSSProperties}> = ({lines, style}) => (
  <>
    {lines.map((l, i) => (
      <div key={i} style={{...style, whiteSpace: 'pre'}}>
        <Segments segs={l} />
      </div>
    ))}
  </>
);

/** The writing caret. In glow mode it carries a much wider bloom. */
export const Caret: React.FC<{h: number; opacity: number; glow?: boolean}> = ({h, opacity, glow}) => (
  <span
    style={{
      display: 'inline-block',
      width: 3,
      height: h,
      marginLeft: 6,
      backgroundColor: glow ? '#eaffc9' : GREEN,
      boxShadow: glow
        ? `0 0 14px rgba(187,251,103,1), 0 0 38px rgba(187,251,103,0.85), 0 0 76px rgba(109,250,200,0.45)`
        : `0 0 12px rgba(187,251,103,0.9)`,
      transform: `translateY(${h * 0.12}px)`,
      opacity,
      verticalAlign: 'baseline',
    }}
  />
);

const toChars = (lines: Line[]) =>
  lines.map((l) => {
    const cs: {ch: string; c: string}[] = [];
    l.forEach((s) => s.t.split('').forEach((ch) => cs.push({ch, c: s.c})));
    return cs;
  });

/** Placeholder leaving: last character first, lifted and blurred out. */
export const DissolveLines: React.FC<{
  lines: Line[];
  style: React.CSSProperties;
  frame: number;
  start: number;
}> = ({lines, style, frame, start}) => (
  <>
    {toChars(lines).map((cs, li) => (
      <div key={li} style={{...style, whiteSpace: 'pre'}}>
        {cs.map((c, i) => {
          const from = start + li * 4 + (cs.length - 1 - i) * 0.55;
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
    ))}
  </>
);

/**
 * Real copy arriving one character at a time behind a caret.
 * `glow` lights each character as it lands and fades the heat off over the next few,
 * then runs one shine across the finished line.
 */
export const TypedLines: React.FC<{
  lines: Line[];
  style: React.CSSProperties;
  frame: number;
  start: number;
  dur: number;
  caretH: number;
  glow?: boolean;
}> = ({lines, style, frame, start, dur, caretH, glow}) => {
  const total = linesLen(lines);
  const exact = interpolate(frame, [start, start + dur], [0, total], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT,
  });
  const n = Math.round(exact);
  const offsets = lineOffsets(lines);
  const done = frame >= start + dur;
  const caretOpacity = interpolate(frame, [start + dur + 4, start + dur + 14], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // which line the caret is sitting on
  let caretLine = 0;
  lines.forEach((l, i) => {
    const len = l.reduce((m, s) => m + s.t.length, 0);
    if (n > offsets[i] || (n === 0 && i === 0)) caretLine = Math.min(i + (n >= offsets[i] + len ? 1 : 0), lines.length - 1);
  });
  if (n >= total) caretLine = lines.length - 1;

  // bloom rides the writing and settles once the line is done
  const bloom = glow
    ? interpolate(frame, [start, start + 8, start + dur, start + dur + 24], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const shine = glow
    ? interpolate(frame, [start + dur - 2, start + dur + 26], [-40, 150], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: EASE_OUT,
      })
    : 0;
  const shineAlpha = glow
    ? interpolate(frame, [start + dur - 2, start + dur + 4, start + dur + 24, start + dur + 30], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const shown = sliceLines(lines, n);

  return (
    <div style={{position: 'relative'}}>
      {toChars(shown).map((cs, li) => (
        <div key={li} style={{...style, whiteSpace: 'pre'}}>
          {cs.map((c, i) => {
            const idx = offsets[li] + i;
            const heat = glow ? Math.max(0, Math.min(1, 1 - (exact - idx) / 7)) : 0;
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  color: c.c,
                  whiteSpace: 'pre',
                  filter: heat > 0.02 ? `brightness(${1 + 0.7 * heat})` : undefined,
                  textShadow:
                    heat > 0.02
                      ? `0 0 ${8 + 20 * heat}px rgba(255,255,255,${0.55 * heat}), 0 0 ${18 + 44 * heat}px rgba(187,251,103,${heat}), 0 0 ${80 * heat}px rgba(109,250,200,${0.6 * heat})`
                      : undefined,
                }}
              >
                {c.ch}
              </span>
            );
          })}
          {li === caretLine && (!done || caretOpacity > 0) ? (
            <Caret h={caretH} opacity={done ? caretOpacity : 1} glow={glow} />
          ) : null}
        </div>
      ))}

      {glow && bloom > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            filter: 'blur(12px)',
            opacity: 0.55 * bloom,
          }}
        >
          {shown.map((l, li) => (
            <div key={li} style={{...style, whiteSpace: 'pre', color: GREEN}}>
              {l.map((s2) => s2.t).join('')}
            </div>
          ))}
        </div>
      ) : null}

      {glow && shineAlpha > 0 ? (
        <div style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none', mixBlendMode: 'screen', opacity: shineAlpha}}>
          {shown.map((l, li) => (
            <div
              key={li}
              style={{
                ...style,
                whiteSpace: 'pre',
                color: 'transparent',
                backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${shine - 30}%, rgba(187,251,103,0.35) ${shine - 10}%, rgba(255,255,255,1) ${shine}%, rgba(187,251,103,0.6) ${shine + 10}%, rgba(255,255,255,0) ${shine + 34}%)`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}
            >
              {l.map((s) => s.t).join('')}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

type Token = {t: string; c: string; space: boolean};

const tokenise = (line: Line): Token[] => {
  const out: Token[] = [];
  line.forEach((s) =>
    s.t.split(/(\s+)/).forEach((part) => {
      if (part === '') return;
      out.push({t: part, c: s.c, space: /^\s+$/.test(part)});
    })
  );
  return out;
};

export const WordsOut: React.FC<{lines: Line[]; style: React.CSSProperties; frame: number; start: number}> = ({
  lines,
  style,
  frame,
  start,
}) => {
  let n = 0;
  return (
    <>
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
    </>
  );
};

export const WordsIn: React.FC<{lines: Line[]; style: React.CSSProperties; frame: number; start: number}> = ({
  lines,
  style,
  frame,
  start,
}) => {
  let n = 0;
  return (
    <>
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
    </>
  );
};
