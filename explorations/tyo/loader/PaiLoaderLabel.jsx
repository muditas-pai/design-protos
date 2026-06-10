import { forwardRef, useEffect } from 'react';
import { PaiLoader } from './PaiLoader.jsx';

export { PaiLoader } from './PaiLoader.jsx';

// Default phase -> label text. Empty string = no label for that phase
// (idle/done render the mark alone). Override via the `labels` prop, or
// bypass the map entirely with an explicit `label` prop.
export const DEFAULT_PAI_LOADER_LABELS = Object.freeze({
  idle: '',
  thinking: 'Thinking',
  searching: 'Searching',
  reasoning: 'Reasoning',
  generating: 'Generating',
  done: '',
});

// One shared stylesheet for the animated ellipsis. Dots are always present
// (no layout shift); only opacity waves across them. Respects reduced-motion.
const ELLIPSIS_STYLE_ID = 'pai-loader-ellipsis-style';
const ELLIPSIS_CSS = `
@keyframes pai-loader-ellipsis { 0%, 70%, 100% { opacity: 0.25; } 35% { opacity: 1; } }
.pai-loader-ellipsis-dot { animation: pai-loader-ellipsis 1.2s infinite ease-in-out; }
@media (prefers-reduced-motion: reduce) {
  .pai-loader-ellipsis-dot { animation: none; opacity: 1; }
}`;

function ensureEllipsisStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(ELLIPSIS_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = ELLIPSIS_STYLE_ID;
  style.textContent = ELLIPSIS_CSS;
  document.head.appendChild(style);
}

function Ellipsis() {
  return (
    <span aria-hidden="true" style={{ marginLeft: 1 }}>
      <span className="pai-loader-ellipsis-dot" style={{ animationDelay: '0s' }}>.</span>
      <span className="pai-loader-ellipsis-dot" style={{ animationDelay: '0.18s' }}>.</span>
      <span className="pai-loader-ellipsis-dot" style={{ animationDelay: '0.36s' }}>.</span>
    </span>
  );
}

/**
 * Loader + label in one inline row. A thin convenience wrapper over <PaiLoader>
 * for the common "spinner next to status text" case. The label is fully
 * restyleable (labelClassName / labelStyle) — reach for the bare <PaiLoader>
 * when you want total control over the text.
 */
export const PaiLoaderLabel = forwardRef(function PaiLoaderLabel({
  phase = 'idle',
  size = 24,
  gap = 8,
  labels = DEFAULT_PAI_LOADER_LABELS,
  label,
  ellipsis = true,
  className,
  style,
  labelClassName,
  labelStyle,
  ...loaderProps
}, ref) {
  useEffect(ensureEllipsisStyle, []);

  const text = label != null ? label : labels[phase];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap,
        ...style,
      }}
    >
      <PaiLoader ref={ref} phase={phase} size={size} {...loaderProps} />
      {text ? (
        <span
          className={labelClassName}
          style={{
            color: '#44445a',
            fontWeight: 450,
            ...labelStyle,
          }}
        >
          {text}
          {ellipsis ? <Ellipsis /> : null}
        </span>
      ) : null}
    </span>
  );
});

export default PaiLoaderLabel;
