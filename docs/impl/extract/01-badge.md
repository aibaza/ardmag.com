# Extract #01: Badge

**Data:** 2026-04-19
**Faza:** A (componente frunza, zero dependente)
**Pagini afectate:** index, category, product

## Status

| Check | Result |
|-------|--------|
| Pixel diff index (mobile/tablet/desktop) | 0 / 0 / 0 ✓ |
| Pixel diff category (mobile/tablet/desktop) | 0 / 0 / 0 ✓ |
| Pixel diff product (mobile/tablet/desktop) | 0 / 0 / 0 ✓ |
| Console errors | 0 ✓ |
| Console warnings | 0 ✓ |
| Compile errors | 0 ✓ |

**VERDICT: PASS -- 0 total diff pixels, 0 console issues**

## Fisiere create

- `src/modules/@shared/components/badge/Badge.tsx` (componenta)
- `src/modules/@shared/components/badge/index.ts` (re-export)

## Fisiere modificate

- `app/[countryCode]/(main)/page.tsx` -- 9 instante Badge inlocuite
- `app/[countryCode]/design-preview/category/page.tsx` -- 7 instante Badge inlocuite
- `app/[countryCode]/design-preview/product/page.tsx` -- 3 instante Badge inlocuite

**Total: 19 instante**

## Props interface

```typescript
type BadgeType = 'promo' | 'new' | 'stock-low' | 'custom';

export interface BadgeProps {
  type: BadgeType;
  label: string;
  dotVariant?: boolean;
}
```

## Decizii arhitecturale

- `dotVariant` prop adauga clasa CSS `dot` la className, replicand exact pattern-ul `badge stock-low dot` din JSX monolitic
- Tag `<span>` pastrat (nu `<div>`) -- identic cu sursele HTML
- `className` generat: `` `badge ${type}${dotVariant ? ' dot' : ''}` `` -- produce exact aceleasi clase ca inline-ul original
- Nicio clasa CSS noua introdusa -- componenta foloseste exclusiv clasele existente din design-system.css
