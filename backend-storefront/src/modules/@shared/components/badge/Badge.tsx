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

/** A corner ribbon for products explicitly marked as newly listed. */
export function NewProductRibbon({ label = "Nou" }: { label?: string }) {
  return <span className="product-new-ribbon">{label}</span>;
}
