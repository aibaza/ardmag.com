import { SVGProps } from "react"

export function TruckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M3 7h13v8H3z"/>
      <path d="M16 10h4l1 3v2h-5z"/>
      <circle cx="7" cy="16" r="2"/>
      <circle cx="17" cy="16" r="2"/>
    </svg>
  )
}

export function ReturnIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M4 8h16l-1 10H5z"/>
      <path d="M8 8V5a4 4 0 0 1 8 0v3"/>
    </svg>
  )
}

export function SecureIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 3 4 6v6c0 5 3 8 8 9 5-1 8-4 8-9V6z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  )
}

export function SupportIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M4 4h16v14H8l-4 4z"/>
      <path d="M8 10h8M8 13h5"/>
    </svg>
  )
}
