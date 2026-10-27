function Icon({ size = 24, className, children, fill = 'none', strokeWidth = 3 }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={fill === 'none' ? 'currentColor' : 'none'}
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      className={className}
    >
      {children}
    </svg>
  )
}

export function ArrowRight(props) {
  return (
    <Icon {...props}>
      <path d="M4 12h16M13 5l7 7-7 7" />
    </Icon>
  )
}

export function ArrowLeft(props) {
  return (
    <Icon {...props}>
      <path d="M20 12H4M11 5l-7 7 7 7" />
    </Icon>
  )
}

export function Play(props) {
  return (
    <Icon {...props} fill="currentColor">
      <path d="M5 3l16 9-16 9z" />
    </Icon>
  )
}

export function Pause(props) {
  return (
    <Icon {...props} fill="currentColor">
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </Icon>
  )
}
