interface SimpleLoaderProps {
  size?: number
  className?: string
}

export function SimpleLoader({ size = 100, className }: SimpleLoaderProps) {
  return (
    <div
      role="status"
      aria-label="Se incarca"
      className={`uiv-loader${className ? ` ${className}` : ""}`}
      style={size !== 100 ? { width: size, height: size } : undefined}
    />
  )
}
