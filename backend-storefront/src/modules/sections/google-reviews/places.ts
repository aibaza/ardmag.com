// Încărcătorul comun al Maps JS API (biblioteca places). Un singur <script> pe pagină,
// indiferent câte componente cer recenziile (hero, banda veche, alte pagini).

let scriptPromise: Promise<any> | null = null

export function incarcaPlaces(key: string): Promise<any> {
  const w = window as any
  if (w.google?.maps?.importLibrary) return w.google.maps.importLibrary("places")
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const cb = "__ardmagPlacesReady"
      w[cb] = () => resolve()
      const s = document.createElement("script")
      s.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({
        key, v: "weekly", libraries: "places", language: "ro", region: "RO", loading: "async", callback: cb,
      }).toString()}`
      s.async = true
      s.onerror = () => { scriptPromise = null; reject(new Error("scriptul Google nu s-a încărcat")) }
      document.head.appendChild(s)
    }).then(() => w.google.maps.importLibrary("places"))
  }
  return scriptPromise
}
