function Svg({ children, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export function CheckIcon({ size }) {
  return (
    <Svg size={size}>
      <path d="m5 13 4 4L19 7" />
    </Svg>
  )
}

export function CopyIcon({ size }) {
  return (
    <Svg size={size}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Svg>
  )
}

export function ArrowIcon({ size }) {
  return (
    <Svg size={size}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  )
}

export function CubeIcon({ size = 22 }) {
  return (
    <Svg size={size}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </Svg>
  )
}

export function CloudIcon({ size = 22 }) {
  return (
    <Svg size={size}>
      <path d="M12 13v8" />
      <path d="m8 17 4-4 4 4" />
      <path d="M20.4 14.5A4.5 4.5 0 0 0 18 6.2 6 6 0 0 0 6.3 8.5 4 4 0 0 0 5 16.3" />
    </Svg>
  )
}

export function RouteIcon({ size = 22 }) {
  return (
    <Svg size={size}>
      <circle cx="6" cy="19" r="3" />
      <circle cx="18" cy="5" r="3" />
      <path d="M9 19h4a5 5 0 0 0 5-5V8" />
    </Svg>
  )
}

export function ShieldIcon({ size = 22 }) {
  return (
    <Svg size={size}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  )
}
