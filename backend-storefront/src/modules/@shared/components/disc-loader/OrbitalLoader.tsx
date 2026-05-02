interface OrbitalLoaderProps {
  size?: number
  className?: string
}

export function OrbitalLoader({ size = 72, className }: OrbitalLoaderProps) {
  const scale = size / 200

  return (
    <div
      role="status"
      aria-label="Se incarca"
      className={className}
      style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}
    >
      <div
        className="orbital-loader"
        style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
      >
        <div className="orbital-loader__inner" />
        <div className="orbital-loader__orbit">
          <div className="orbital-loader__dot" />
          <div className="orbital-loader__dot" />
          <div className="orbital-loader__dot" />
          <div className="orbital-loader__dot" />
        </div>
      </div>
    </div>
  )
}
