export interface ProductCardSpecTagProps {
  label: string
}

export function ProductCardSpecTag({ label }: ProductCardSpecTagProps) {
  return (
    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 6px', background: 'var(--stone-100)', borderRadius: 'var(--r-sm)', color: 'var(--stone-700)' }}>{label}</span>
  )
}
