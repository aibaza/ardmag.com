const BASE = process.env.FAN_COURIER_API_URL || "https://api.fancourier.ro"

export interface LoginResult {
  token: string
  expiresAt: string
}

export async function loginFanCourier(): Promise<LoginResult> {
  const user = encodeURIComponent(process.env.FAN_COURIER_USERNAME!)
  const pass = encodeURIComponent(process.env.FAN_COURIER_PASSWORD!)
  const resp = await fetch(`${BASE}/login?username=${user}&password=${pass}`, { method: "POST" })
  if (!resp.ok) throw new Error(`Fan Courier login failed: ${resp.status}`)
  const json = await resp.json()
  if (!json.data?.token) throw new Error("Fan Courier login: token missing in response")
  return { token: json.data.token, expiresAt: json.data.expiresAt }
}

export interface TariffParams {
  token: string
  weight: number     // kg
  county: string     // judet destinatar
  locality: string   // localitate destinatar
}

export async function getInternalTariff(params: TariffParams): Promise<number> {
  const clientId = process.env.FAN_COURIER_CLIENT_ID!
  const url = new URL(`${BASE}/reports/awb/internal-tariff`)
  url.searchParams.set("clientId", clientId)
  url.searchParams.set("info[service]", "Standard")
  url.searchParams.set("info[payment]", "expeditor")
  url.searchParams.set("info[weight]", String(params.weight))
  url.searchParams.set("info[packages][parcel]", "1")
  url.searchParams.set("recipient[county]", params.county)
  url.searchParams.set("recipient[locality]", params.locality)

  const resp = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${params.token}` },
  })
  if (!resp.ok) throw new Error(`Fan Courier tariff failed: ${resp.status}`)
  const json = await resp.json()
  if (typeof json.data?.total !== "number") throw new Error("Fan Courier tariff: total missing")
  return json.data.total as number
}
