// Verifica beacon-ul first-party public/a-b.js: click pe a[href^="tel:"]
// trimite evenimentul tel_click (cookieless, fail-open), pe langa pageview-ul
// initial. Ruleaza sursa reala din public/ intr-un sandbox vm cu stub-uri
// minime de DOM, ca sa nu divergem intre test si fisierul livrat.

import { describe, it, expect, beforeEach } from "vitest"
import { readFileSync } from "fs"
import { resolve } from "path"
import vm from "vm"

const BEACON_SRC = readFileSync(
  resolve(__dirname, "../../../../public/a-b.js"),
  "utf8"
)

type Sent = { endpoint: string; payload: Record<string, unknown> }

type Listener = { type: string; fn: (e: unknown) => void; capture: boolean }

function bootBeacon() {
  const sent: Sent[] = []
  const listeners: Listener[] = []
  const storage = new Map<string, string>()

  class FakeBlob {
    parts: string[]
    constructor(parts: string[]) {
      this.parts = parts
    }
  }

  const sandbox: Record<string, unknown> = {
    document: {
      currentScript: {
        getAttribute: (name: string) =>
          name === "data-site" ? "ardmag.ro" : null,
      },
      referrer: "",
    },
    location: { hostname: "ardmag.ro", search: "", pathname: "/contact" },
    sessionStorage: {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => storage.set(k, v),
    },
    history: { pushState: () => undefined },
    navigator: {
      sendBeacon: (endpoint: string, blob: FakeBlob) => {
        sent.push({ endpoint, payload: JSON.parse(blob.parts[0]) })
        return true
      },
    },
    addEventListener: (type: string, fn: (e: unknown) => void, capture?: boolean) => {
      listeners.push({ type, fn, capture: capture === true })
    },
    URLSearchParams,
    Blob: FakeBlob,
    fetch: () => Promise.resolve(),
  }
  sandbox.window = sandbox

  vm.runInNewContext(BEACON_SRC, sandbox)
  return { sent, listeners }
}

function telClickEvent(href: string | null) {
  return {
    target: {
      closest: (selector: string) =>
        selector === 'a[href^="tel:"]' && href
          ? { getAttribute: () => href }
          : null,
    },
  }
}

describe("a-b.js beacon - tel_click", () => {
  let sent: Sent[]
  let listeners: Listener[]

  beforeEach(() => {
    ;({ sent, listeners } = bootBeacon())
  })

  it("trimite pageview la incarcare", () => {
    expect(sent).toHaveLength(1)
    expect(sent[0].endpoint).toBe("/a")
    expect(sent[0].payload.event).toBe("pageview")
    expect(sent[0].payload.site).toBe("ardmag.ro")
  })

  it("inregistreaza listener de click in capture-phase", () => {
    const click = listeners.filter((l) => l.type === "click")
    expect(click).toHaveLength(1)
    expect(click[0].capture).toBe(true)
  })

  it("click pe a[href^=tel:] trimite tel_click cu href", () => {
    const click = listeners.find((l) => l.type === "click")!
    click.fn(telClickEvent("tel:+40722155441"))
    expect(sent).toHaveLength(2)
    expect(sent[1].payload.event).toBe("tel_click")
    expect(sent[1].payload.site).toBe("ardmag.ro")
    expect((sent[1].payload.extra as { href: string }).href).toBe(
      "tel:+40722155441"
    )
  })

  it("click in afara linkurilor tel: nu trimite nimic", () => {
    const click = listeners.find((l) => l.type === "click")!
    click.fn(telClickEvent(null))
    expect(sent).toHaveLength(1)
  })

  it("listener-ul e fail-open la target fara closest", () => {
    const click = listeners.find((l) => l.type === "click")!
    expect(() => click.fn({ target: null })).not.toThrow()
    expect(sent).toHaveLength(1)
  })
})
