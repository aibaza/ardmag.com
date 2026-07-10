// Wrapper client-side peste beacon-ul first-party (public/a-b.js).
// a-b.js se incarca afterInteractive, deci window.aB poate lipsi cand
// componentele hidrateaza: evenimentele se pun in coada si se retrimit
// cand beacon-ul apare (retry 500ms, max ~20s, apoi fail-open).
// Traficul non-productie (localhost, *.vercel.app, test.ardmag.ro) se
// TAGUIESTE cu env:'test' in extra - nu se blocheaza niciodata.

type AbExtra = Record<string, string | number>

declare global {
  interface Window {
    aB?: { track: (event: string, props?: Record<string, unknown>) => void }
  }
}

const queue: Array<{ event: string; extra: AbExtra }> = []
let retryTimer: ReturnType<typeof setInterval> | null = null

function envTag(): AbExtra {
  return window.location.hostname === 'ardmag.ro' ? {} : { env: 'test' }
}

export function abTrack(event: string, extra: AbExtra) {
  if (typeof window === 'undefined') return
  const tagged = { ...extra, ...envTag() }
  if (window.aB?.track) {
    window.aB.track(event, { extra: tagged })
    return
  }
  queue.push({ event, extra: tagged })
  if (retryTimer) return
  let tries = 0
  retryTimer = setInterval(() => {
    if (window.aB?.track) {
      const pending = queue.splice(0)
      for (const item of pending) window.aB.track(item.event, { extra: item.extra })
      clearInterval(retryTimer!)
      retryTimer = null
    } else if (++tries > 40) {
      clearInterval(retryTimer!)
      retryTimer = null
    }
  }, 500)
}
