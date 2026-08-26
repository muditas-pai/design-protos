import {Bar, Field, SlideSpec, changed, isField, linesLen} from './types';

export type Beat = {
  id: string;
  /** when the placeholder starts leaving; -1 for a field whose text does not change */
  outAt: number;
  /** when the real content starts arriving */
  inAt: number;
  inDur: number;
  /** when this node travels to its final position */
  moveAt: number;
};

export type Plan = {
  beats: Record<string, Beat>;
  picture?: {start: number; end: number};
  total: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const build = (
  spec: SlideSpec,
  beats: Beat[],
  textEnd: number,
  picture: {start: number; end: number} | undefined,
  tail: number
): Plan => {
  const byId: Record<string, Beat> = {};
  beats.forEach((b) => (byId[b.id] = b));
  // a node can borrow another's move, so an item's heading and body travel together
  spec.order.forEach((n) => {
    const via = (n as Field | Bar).moveWith;
    if (via && byId[n.id] && byId[via]) byId[n.id] = {...byId[n.id], moveAt: byId[via].moveAt};
  });
  const end = picture ? Math.max(textEnd, picture.end) : textEnd;
  return {beats: byId, picture, total: Math.round(end + tail)};
};

/**
 * Everything at once, each field a beat behind the last. This is the shape treatments 1, 2,
 * 3 and 5 share; the slide's own length falls out of how many fields it has.
 */
export const parallelPlan = (spec: SlideSpec): Plan => {
  const STEP = 22;
  const LEAD = 30;
  const GAP = 26;
  const dur = (f: Field) => (changed(f) ? clamp(linesLen(f.to.lines) * 1.9, 24, 56) : 16);

  const changing = spec.order.filter((n): n is Field => isField(n) && changed(n));
  const beats: Beat[] = [];
  let textEnd = 0;

  spec.order.forEach((n) => {
    const i = isField(n) && changed(n) ? changing.indexOf(n) : 0;
    const outAt = isField(n) && changed(n) ? LEAD + i * STEP : -1;
    const inAt = LEAD + GAP + i * STEP;
    const d = isField(n) ? dur(n) : 16;
    beats.push({id: n.id, outAt, inAt, inDur: d, moveAt: inAt - 10});
    textEnd = Math.max(textEnd, inAt + d);
  });

  // the picture runs alongside the text and lands just after it
  const picture = spec.picture ? {start: 40, end: Math.max(textEnd + 8, 142)} : undefined;
  return build(spec, beats, textEnd, picture, 60);
};

/**
 * One node at a time, nothing overlapping. Unchanged fields and the rule still take a short
 * turn of their own — in this treatment the order is the subject, so skipping them would
 * read as them being missed rather than as them being already right.
 */
export const sequentialPlan = (spec: SlideSpec): Plan => {
  const OUT = 12;
  const SETTLE = 14;
  const dur = (f: Field) => clamp(linesLen(f.to.lines) * 1.6, 20, 46);

  const beats: Beat[] = [];
  let t = 24;

  spec.order.forEach((n) => {
    if (isField(n) && changed(n)) {
      const outAt = t;
      const inAt = t + OUT + 4;
      const d = dur(n);
      beats.push({id: n.id, outAt, inAt, inDur: d, moveAt: inAt - 8});
      t = inAt + d + 4;
    } else {
      beats.push({id: n.id, outAt: -1, inAt: t, inDur: SETTLE, moveAt: t});
      t += SETTLE + 4;
    }
  });

  // in this treatment the picture waits its turn like everything else
  const picture = spec.picture ? {start: t + 8, end: t + 98} : undefined;
  return build(spec, beats, t, picture, 55);
};
