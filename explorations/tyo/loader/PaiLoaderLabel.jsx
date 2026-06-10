import { forwardRef } from 'react';
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
  className,
  style,
  labelClassName,
  labelStyle,
  ...loaderProps
}, ref) {
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
        </span>
      ) : null}
    </span>
  );
});

export default PaiLoaderLabel;
