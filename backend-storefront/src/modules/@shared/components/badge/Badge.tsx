type BadgeType = 'promo' | 'new' | 'stock-low' | 'custom';

export interface BadgeProps {
  type: BadgeType;
  label: string;
  dotVariant?: boolean;
}

export function Badge({ type, label, dotVariant }: BadgeProps) {
  return (
    <span className={`badge ${type}${dotVariant ? ' dot' : ''}`}>{label}</span>
  );
}
