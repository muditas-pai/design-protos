import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FooterBlock, MosaicPhoto, PhotoFrame, Segments, SharpPhoto, footStyle, subStyle, titleStyle} from './slide';
import {FINAL, GREEN, L, TEMPLATE} from './theme';

const Block: React.FC<{
  top: number;
  titleH: number;
  titleOpacity: number;
  bodyOpacity: number;
  lines: {t: string; c: string}[][];
  subtitle: string;
}> = ({top, titleH, titleOpacity, bodyOpacity, lines, subtitle}) => (
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
    <div style={{height: titleH, opacity: titleOpacity}}>
      {lines.map((line, i) => (
        <div key={i} style={titleStyle}>
          <Segments segs={line} />
        </div>
      ))}
    </div>
    <div style={{width: L.dividerW, height: L.dividerH, backgroundColor: GREEN}} />
    <div style={{...subStyle, opacity: bodyOpacity}}>{subtitle}</div>
  </div>
);

/** The slide exactly as the template ships it — bracketed placeholders, mosaic picture. */
export const TemplateContent: React.FC = () => (
  <AbsoluteFill>
    <Block
      top={L.titleTopTemplate}
      titleH={L.titleLine * 2}
      titleOpacity={TEMPLATE.titleOpacity}
      bodyOpacity={TEMPLATE.bodyOpacity}
      lines={TEMPLATE.titleLines}
      subtitle={TEMPLATE.subtitle}
    />
    <FooterBlock opacity={TEMPLATE.bodyOpacity}>
      {TEMPLATE.footLines.map((line, i) => (
        <div key={i} style={footStyle}>
          <Segments segs={line} />
        </div>
      ))}
    </FooterBlock>
    <PhotoFrame>
      <MosaicPhoto grid={1} wash={1} />
    </PhotoFrame>
  </AbsoluteFill>
);

/** The same slide once the copy and the picture are real. */
export const FinalContent: React.FC<{frameGlow?: number}> = ({frameGlow = 0}) => (
  <AbsoluteFill>
    <Block
      top={L.titleTopFinal}
      titleH={L.titleLine}
      titleOpacity={FINAL.titleOpacity}
      bodyOpacity={FINAL.bodyOpacity}
      lines={FINAL.titleLines}
      subtitle={FINAL.subtitle}
    />
    <FooterBlock opacity={FINAL.bodyOpacity}>
      {FINAL.footLines.map((line, i) => (
        <div key={i} style={footStyle}>
          <Segments segs={line} />
        </div>
      ))}
    </FooterBlock>
    <PhotoFrame glow={frameGlow}>
      <SharpPhoto />
    </PhotoFrame>
  </AbsoluteFill>
);
