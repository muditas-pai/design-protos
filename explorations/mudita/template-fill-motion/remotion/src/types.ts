import React from 'react';

export type Seg = {t: string; c: string};
export type Line = Seg[];

/** One state of a text field — where it sits, what it says, how bright it is. */
export type FieldState = {top: number; lines: Line[]; opacity: number};

/**
 * A run of text that differs between the template and the filled slide.
 * `moveWith` names the changing field whose turn also carries this one's reflow, so an
 * item's heading and body shift together when the body grows a line.
 */
export type Field = {
  id: string;
  x: number;
  width: number;
  style: React.CSSProperties;
  caretH: number;
  from: FieldState;
  to: FieldState;
  moveWith?: string;
};

/** A non-text element that moves or appears between the two states — the green rule. */
export type Bar = {
  id: string;
  x: number;
  width: number;
  height: number;
  from: {top: number; opacity: number};
  to: {top: number; opacity: number};
  moveWith?: string;
};

export type Picture = {
  x: number;
  y: number;
  w: number;
  h: number;
  border: number;
  radius: string;
  /** the photograph's own box inside the frame, from Figma's crop */
  photo: {w: number; h: number; top: number};
  src: string;
  mosaicSrc: string;
  cols: number;
  rows: number;
};

export type SlideSpec = {
  id: string;
  label: string;
  backdrop: {left: number; top: number; width: number; height: number};
  /** static decoration that is identical in both states and never animates */
  Chrome?: React.FC;
  /** in the order the slide should be worked through */
  order: (Field | Bar)[];
  picture?: Picture;
};

export const isField = (n: Field | Bar): n is Field => 'lines' in (n as Field).from;

export const linesText = (lines: Line[]) => lines.map((l) => l.map((s) => s.t).join('')).join('\n');

export const linesLen = (lines: Line[]) => lines.reduce((n, l) => n + l.reduce((m, s) => m + s.t.length, 0), 0);

/** Trim a whole field's worth of coloured lines to the first `n` characters. */
export const sliceLines = (lines: Line[], n: number): Line[] => {
  let used = 0;
  return lines.map((line) =>
    line.map((s) => {
      const take = Math.max(0, Math.min(s.t.length, n - used));
      used += s.t.length;
      return {...s, t: s.t.slice(0, take)};
    })
  );
};

/** How many characters of a field are already visible on line `i`, and how many remain. */
export const lineOffsets = (lines: Line[]) => {
  const out: number[] = [];
  let used = 0;
  lines.forEach((l) => {
    out.push(used);
    used += l.reduce((m, s) => m + s.t.length, 0);
  });
  return out;
};

export const changed = (f: Field) => linesText(f.from.lines) !== linesText(f.to.lines);
