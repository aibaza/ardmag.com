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

/** Banderola de reducere pe toata latimea imaginii cardului: „-20% PREȚ REDUS”. */
export function PromoBand({ label }: { label: string }) {
  return (
    <span className="pcard-promo-band">
      <b>{label}</b>
      <span>Preț redus</span>
    </span>
  );
}
