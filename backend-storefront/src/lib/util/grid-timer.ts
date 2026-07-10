// Programeaza un callback pe grila ceasului de perete: fire la fiecare
// periodMs, decalat cu offsetMs fata de epoch. Cele doua carusele de pe
// homepage (rotatia variantelor de hero si ticker-ul de articole) folosesc
// aceeasi perioada cu offset de jumatate de perioada, ca sa comute exact in
// contratimp - indiferent de momentul montarii, de pauze la hover sau de
// tab-uri ascunse, fazele raman blocate pe grila.

export function scheduleOnWallClockGrid(periodMs: number, offsetMs: number, cb: () => void): () => void {
  let timer: ReturnType<typeof setTimeout>
  const loop = () => {
    const wait = periodMs - ((Date.now() - offsetMs) % periodMs)
    timer = setTimeout(() => {
      cb()
      loop()
    }, Math.max(wait, 50))
  }
  loop()
  return () => clearTimeout(timer)
}
