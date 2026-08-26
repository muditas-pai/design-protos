import React from 'react';
import {Img, staticFile} from 'remotion';
import {FONT, GREEN} from '../theme';
import {Field, SlideSpec} from '../types';

// Read off Figma nodes 813:36712 (template) and 813:36592 (filled).
// No picture on this slide: the semicircular diagram and its three icons are identical in
// both states, so they are chrome. What changes is six runs of text plus the subtitle, which
// the filled slide replaces with the green rule.

const titleStyle = {fontFamily: FONT, fontSize: 80, lineHeight: '82px', letterSpacing: -1, color: '#fff'};
const subStyle = {fontFamily: FONT, fontSize: 30, lineHeight: '38px', color: '#fff'};
const headStyle = {fontFamily: FONT, fontSize: 36, fontWeight: 600, lineHeight: '48px', letterSpacing: -0.3, color: '#fff'};
const bodyStyle = {fontFamily: FONT, fontSize: 28, lineHeight: '38px', color: '#fff'};

const ITEM_X = 1279.72;
const ITEM_W = 520;

/** The arc, the three icon circles and the connector lines, exported whole from Figma. */
const Chrome: React.FC = () => (
  <Img
    src={staticFile('diagram.svg')}
    style={{position: 'absolute', left: 492, top: 121, width: 749.93, height: 838.87}}
  />
);

const title: Field = {
  id: 'title',
  x: 120,
  width: 720,
  style: titleStyle,
  caretH: 58,
  from: {
    top: 470,
    opacity: 1,
    lines: [
      [
        {t: 'The ', c: '#fff'},
        {t: 'Opportunity', c: GREEN},
      ],
    ],
  },
  to: {
    top: 481,
    opacity: 1,
    lines: [
      [
        {t: 'The ', c: '#fff'},
        {t: 'Opportunity', c: GREEN},
      ],
    ],
  },
  moveWith: 'subtitle',
};

/** The template's strapline; the filled slide has the rule in its place instead. */
const subtitle: Field = {
  id: 'subtitle',
  x: 120,
  width: 720,
  style: subStyle,
  caretH: 24,
  from: {top: 572, opacity: 0.4, lines: [[{t: '[Why this is worth doing, and why now]', c: '#fff'}]]},
  to: {top: 572, opacity: 0, lines: [[]]},
};

const rule = {
  id: 'rule',
  x: 120,
  width: 170,
  height: 8,
  from: {top: 591, opacity: 0},
  to: {top: 591, opacity: 1},
  moveWith: 'subtitle',
};

const item = (
  n: number,
  headTop: [number, number],
  bodyTop: [number, number],
  fromHead: string,
  fromBody: string[],
  toHead: string,
  toBody: string[]
): Field[] => [
  {
    id: `item${n}-head`,
    x: ITEM_X,
    width: ITEM_W,
    style: headStyle,
    caretH: 32,
    // the heading is full white in both states — only its words change
    from: {top: headTop[0], opacity: 1, lines: [[{t: fromHead, c: '#fff'}]]},
    to: {top: headTop[1], opacity: 1, lines: [[{t: toHead, c: '#fff'}]]},
    moveWith: `item${n}-body`,
  },
  {
    id: `item${n}-body`,
    x: ITEM_X,
    width: ITEM_W,
    style: bodyStyle,
    caretH: 24,
    from: {top: bodyTop[0], opacity: 0.5, lines: fromBody.map((t) => [{t, c: '#fff'}])},
    to: {top: bodyTop[1], opacity: 1, lines: toBody.map((t) => [{t, c: '#fff'}])},
  },
];

// Line breaks are the ones Figma set. Body copy is hand-wrapped rather than left to the
// browser because the shipping face here (Familjen Grotesk) is not the one in the file.
const item1 = item(
  1,
  [127.66, 107.66],
  [191.66, 171.66],
  'Customer Reality',
  ['[The thing that is true about their', 'customers that makes this obvious]'],
  'Potential customers',
  ["68% of Corva's small business", 'customers bank outside their', 'accounting tool and reconcile by hand.']
);

const item2 = item(
  2,
  [470.66, 450.66],
  [534.66, 514.66],
  'Timing Factor',
  ['[The timing reason. A launch, a season,', 'a deadline]'],
  'Ship in time',
  ["Ledgerline's live sync ships 6 Apr,", 'four weeks before the quarterly', 'filing deadline.']
);

const item3 = item(
  3,
  [813.66, 813.66],
  [877.66, 877.66],
  'Integration Ease',
  ['[Why neither side has to build anything', 'new for it to work]'],
  'Free up bandwidth',
  ['Neither side builds anything new for', 'this. The integration is the campaign.']
);

export const OPPORTUNITY: SlideSpec = {
  id: 'opportunity',
  label: 'The Opportunity',
  backdrop: {left: -703, top: -1257, width: 3506, height: 2337},
  Chrome,
  order: [title, subtitle, rule, ...item1, ...item2, ...item3],
};
