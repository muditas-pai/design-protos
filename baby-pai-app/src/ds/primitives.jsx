import { useId } from 'react'

/* The rest of pai.css's vocabulary, wrapped. Each is a class-name mapping and
   nothing more — no styles are declared here, so nothing can drift from
   design-system/pai.css. */

/* ---- Badge --------------------------------------------------------------- */
const BADGE = {
  pro: 'pai-badge-pro',
  gold: 'pai-badge-gold',
  basic: 'pai-badge-basic',
  neutral: 'pai-badge-neutral',
  free: 'pai-badge-free',
}

export function Badge({ variant = 'pro', className = '', children, ...rest }) {
  return (
    <span className={`pai-badge ${BADGE[variant] ?? BADGE.pro} ${className}`.trim()} {...rest}>
      {children}
    </span>
  )
}

/* ---- Input / Textarea ---------------------------------------------------- */
export function Input({ size = 'md', error = false, className = '', ...rest }) {
  const cls = ['pai-input', size === 'lg' && 'pai-input--lg', error && 'is-error', className]
    .filter(Boolean).join(' ')
  return <input className={cls} aria-invalid={error || undefined} {...rest} />
}

export function Textarea({ className = '', ...rest }) {
  return <textarea className={`pai-textarea ${className}`.trim()} {...rest} />
}

/* ---- Checkbox / Radio / Field -------------------------------------------- */
export function Checkbox({ className = '', ...rest }) {
  return <input type="checkbox" className={`pai-checkbox ${className}`.trim()} {...rest} />
}

export function Radio({ className = '', ...rest }) {
  return <input type="radio" className={`pai-radio ${className}`.trim()} {...rest} />
}

/* control + label row; generates the id/htmlFor pairing so the label is
   clickable without every caller remembering to wire it */
export function Field({ label, control: Control = Checkbox, id, className = '', ...rest }) {
  const auto = useId()
  const fieldId = id ?? auto
  return (
    <span className={`pai-field ${className}`.trim()}>
      <Control id={fieldId} {...rest} />
      <label htmlFor={fieldId}>{label}</label>
    </span>
  )
}

/* ---- Toggle -------------------------------------------------------------- */
export function Toggle({ className = '', ...rest }) {
  return (
    <label className={`pai-toggle ${className}`.trim()}>
      <input type="checkbox" {...rest} />
      <span className="track" />
      <span className="knob" />
    </label>
  )
}

/* ---- Tooltip ------------------------------------------------------------- */
export function Tooltip({ header, className = '', children, ...rest }) {
  return (
    <span className={`pai-tooltip ${className}`.trim()} role="tooltip" {...rest}>
      {header && <strong className="pai-tooltip-header">{header}</strong>}
      {children}
    </span>
  )
}

/* ---- Skeleton ------------------------------------------------------------ */
export function Skeleton({ width, height = 12, radius, className = '', style, ...rest }) {
  return (
    <span
      className={`pai-skeleton ${className}`.trim()}
      aria-hidden="true"
      style={{ display: 'block', width, height, borderRadius: radius, ...style }}
      {...rest}
    />
  )
}

/* ---- Typography ---------------------------------------------------------- */
/* pai.css's text-* scale, as a component so design-system usage is greppable
   rather than a loose string in every file. */
export const TEXT = {
  'heading-4xl': 'text-heading-4xl', 'heading-3xl': 'text-heading-3xl',
  'heading-2xl': 'text-heading-2xl', 'heading-xl': 'text-heading-xl',
  'heading-lg': 'text-heading-lg', 'heading-base': 'text-heading-base',
  'heading-sm': 'text-heading-sm',
  'body-xl-regular': 'text-body-xl-regular', 'body-xl-medium': 'text-body-xl-medium',
  'body-lg-regular': 'text-body-lg-regular', 'body-lg-medium': 'text-body-lg-medium',
  'body-lg-semibold': 'text-body-lg-semibold',
  'body-base-regular': 'text-body-base-regular', 'body-base-medium': 'text-body-base-medium',
  'body-base-semibold': 'text-body-base-semibold',
  'body-sm-regular': 'text-body-sm-regular', 'body-sm-medium': 'text-body-sm-medium',
  'body-xs-regular': 'text-body-xs-regular', 'body-xs-medium': 'text-body-xs-medium',
  'overline-small': 'text-overline-small',
}

export function Text({ as: As = 'span', variant = 'body-base-regular', className = '', ...rest }) {
  return <As className={`${TEXT[variant] ?? TEXT['body-base-regular']} ${className}`.trim()} {...rest} />
}
