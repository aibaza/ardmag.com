# Extract #02: Button

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

**VERDICT: PASS — 0 total diff pixels, 0 console issues**

## Fisiere create

- `src/modules/@shared/components/button/Button.tsx`
- `src/modules/@shared/components/button/index.ts`

## Instante inlocuite

- `index`: 8 butoane "Adaugă" (btn primary sm)
- `category`: 12 butoane "Adaugă" (btn primary sm)
- `product`: 4 butoane "Adaugă" (btn primary sm)
- **Total: 24 instante**

## Decizii arhitecturale

- Inlocuite NUMAI butoanele `.btn.primary.sm` "Adaugă" din product cards — identice structural pe toate paginile
- Butoanele cu context specific (PDP add-to-cart, filtre, header) raman inline — vor fi extrase cu componenta parinte
- `ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>` — permite orice prop HTML nativ fara re-declarare
- `className` override disponibil pentru cazuri speciale
