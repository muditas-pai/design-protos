/* Thin wrapper over pai.css's .button-style vocabulary. It does not restyle
   anything — every rule still lives in design-system/pai.css, which is imported
   whole. If Tyo changes a button there, it changes here. */

const SIZE = { large: 'button-large', medium: 'button-medium', small: 'button-small' }

const VARIANT = {
  primary: 'button-primary',
  'primary-brand': 'button-primary-brand',
  'primary-dark': 'button-primary-dark',
  'primary-danger': 'button-primary-danger',
  secondary: 'button-secondary',
  'secondary-brand': 'button-secondary-brand',
  'secondary-danger': 'button-secondary-danger',
  tertiary: 'button-tertiary',
  'tertiary-danger': 'button-tertiary-danger',
  ghost: 'button-ghost',
  'ghost-danger': 'button-ghost-danger',
  dark: 'button-dark',
}

export default function Button({
  variant = 'primary',
  size = 'medium',
  iconOnly = false,
  leading,
  trailing,
  disabled = false,
  dim = 40,
  className = '',
  children,
  ...rest
}) {
  const cls = [
    'button-style',
    SIZE[size] ?? SIZE.medium,
    VARIANT[variant] ?? VARIANT.primary,
    iconOnly && 'icon-only',
    disabled && `button-disabled button-disabled-${dim}`,
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={cls} disabled={disabled} aria-disabled={disabled || undefined} {...rest}>
      {leading}
      {/* .button-label picks up the 6px gap rule only when it isn't first */}
      {children != null && <span className="button-label">{children}</span>}
      {trailing}
    </button>
  )
}
