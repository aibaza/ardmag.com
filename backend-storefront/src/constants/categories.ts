// Ardmag product categories - single source of truth
// Handles verified against Medusa backend 2026-04-19
export const CATEGORIES = [
  { handle: "mastici-tenax",         name: "MASTICI TENAX",          productCount: 20 },
  { handle: "solutii-pentru-piatra", name: "SOLUȚII PENTRU PIATRĂ",  productCount: 33 },
  { handle: "diverse",               name: "DIVERSE",                 productCount: 13 },
  { handle: "slefuire-piatra",       name: "ȘLEFUIRE PIATRĂ",        productCount: 10 },
  { handle: "discuri-de-taiere",     name: "DISCURI DE TĂIERE",      productCount: 7  },
  { handle: "abrazivi-si-perii",     name: "ABRAZIVI ȘI PERII",      productCount: 3  },
  { handle: "mese-de-taiat",         name: "MESE DE TĂIAT",          productCount: 2  },
  { handle: "pachete-promotionale",  name: "PACHETE PROMOȚIONALE",   productCount: 1  },
  { handle: "abrazivi-oala",         name: "ABRAZIVI OALĂ",          productCount: 1  },
] as const

export type CategoryHandle = typeof CATEGORIES[number]["handle"]
