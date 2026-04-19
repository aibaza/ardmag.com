# Extract #03: ProductCardSpecTag

**Data:** 2026-04-19 | **Faza:** A | **Pagini afectate:** category

## Status

| Check | Result |
|-------|--------|
| Pixel diff category (mobile/tablet/desktop) | 0 / 0 / 0 ✓ |
| Console errors/warnings | 0 ✓ |
| Compile errors | 0 ✓ |

**VERDICT: PASS**

## Risc rezolvat

Risul critic identificat in analiza: 36 inline `style={{...}}` identice pe 12 product cards (3 tags x 12 cards). Extrase in `ProductCardSpecTag` cu style identic pastrat.

## Fisiere create

- `src/modules/@shared/components/product-card-spec-tag/ProductCardSpecTag.tsx`
- `src/modules/@shared/components/product-card-spec-tag/index.ts`

## Instante: 36 span-uri → `<ProductCardSpecTag />` (12 cards x 3 tags)

## Decizie: style inline pastrat ad litteram

Componenta pastreaza `style={{...}}` obiect — `whiteSpace` absent din sursa reala (era in spec, nu in fisier). Mutarea in CSS class este o decizie separata de Faza 2.
