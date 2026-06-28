import { createHash } from "crypto"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const PIXEL_ID = process.env.META_PIXEL_ID
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v21.0"

const ALLOWED_EVENTS = new Set(["ViewContent", "AddToCart", "InitiateCheckout"])

type MetaEventName = "ViewContent" | "AddToCart" | "InitiateCheckout"

type MetaContent = {
  id: string
  quantity?: number
  item_price?: number
}

type MetaCapiTrackBody = {
  event_name?: string
  event_id?: string
  event_source_url?: string
  fbp?: string
  fbc?: string
  em?: string
  contents?: MetaContent[]
  value?: number
  currency?: string
}

function hash(value?: string | null): string | undefined {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (!normalized) return undefined
  return createHash("sha256").update(normalized).digest("hex")
}

function isMetaEventName(value: string | undefined): value is MetaEventName {
  return !!value && ALLOWED_EVENTS.has(value)
}

function cleanString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function cleanNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function cleanContents(value: unknown): MetaContent[] | undefined {
  if (!Array.isArray(value)) return undefined

  const contents = value
    .map((item) => {
      if (!item || typeof item !== "object") return undefined
      const source = item as Record<string, unknown>
      const id = cleanString(source.id)
      if (!id) return undefined

      const quantity = cleanNumber(source.quantity)
      const itemPrice = cleanNumber(source.item_price)
      return {
        id,
        ...(quantity !== undefined ? { quantity } : {}),
        ...(itemPrice !== undefined ? { item_price: itemPrice } : {}),
      }
    })
    .filter((item): item is MetaContent => !!item)

  return contents.length ? contents : undefined
}

export async function POST(req: NextRequest) {
  let body: MetaCapiTrackBody
  try {
    body = (await req.json()) as MetaCapiTrackBody
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const eventName = body.event_name

  if (!isMetaEventName(eventName)) {
    return NextResponse.json({ error: "Invalid event_name" }, { status: 400 })
  }

  const eventId = cleanString(body.event_id)
  const eventSourceUrl = cleanString(body.event_source_url)
  if (!eventId || !eventSourceUrl) {
    return NextResponse.json(
      { error: "Missing event_id or event_source_url" },
      { status: 400 }
    )
  }

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.debug(
      `[meta-capi] Skipped ${eventName} - set META_PIXEL_ID and META_CAPI_ACCESS_TOKEN to enable server-side events`
    )
    return NextResponse.json({ ok: true, skipped: true })
  }

  const userData: Record<string, string[] | string> = {}
  const fbp = cleanString(body.fbp)
  const fbc = cleanString(body.fbc)
  const em = hash(body.em)
  if (fbp) userData.fbp = fbp
  if (fbc) userData.fbc = fbc
  if (em) userData.em = [em]

  const contents = cleanContents(body.contents)
  const value = cleanNumber(body.value)
  const currency = cleanString(body.currency)?.toUpperCase()

  const customData: Record<string, unknown> = {
    content_type: "product",
  }
  if (currency) customData.currency = currency
  if (value !== undefined) customData.value = value
  if (contents) {
    customData.content_ids = contents.map((c) => c.id)
    customData.contents = contents
    customData.num_items = contents.reduce((sum, c) => sum + (c.quantity ?? 0), 0)
  }

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: eventSourceUrl,
        user_data: userData,
        custom_data: customData,
      },
    ],
    ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
  }

  try {
    const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(
      ACCESS_TOKEN
    )}`
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "")
      console.error(
        `[meta-capi] ${eventName} ${eventId} failed: HTTP ${response.status} ${text.slice(0, 300)}`
      )
      return NextResponse.json({ error: "Meta CAPI request failed" }, { status: 502 })
    }

    console.info(`[meta-capi] Sent server-side ${eventName} ${eventId}`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(`[meta-capi] Error sending ${eventName} ${eventId}: ${err}`)
    return NextResponse.json({ error: "Meta CAPI request failed" }, { status: 500 })
  }
}
