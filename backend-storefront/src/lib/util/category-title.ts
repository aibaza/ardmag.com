// Formatare consecventa pentru numele categoriilor afisate utilizatorului.
// Convertim orice format din DB ("MASTICI TENAX", "mastici tenax", "Mastici tenax")
// la Title Case proper ("Mastici Tenax").
export function formatCategoryTitle(name: string | null | undefined): string {
  if (!name) return ""
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => (word.length ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ")
}
