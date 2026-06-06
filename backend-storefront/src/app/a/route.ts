// First-party analytics endpoint: receives beacon events from the browser
// (same-origin POST, adblock-resistant) and forwards them server-side to the
// central portfolio collector (Cloudflare Worker + Analytics Engine).
//
// Fail-open by design: when COLLECTOR_URL is unset or the collector is down,
// we still return 202 - the product never depends on analytics.

export async function POST(request: Request): Promise<Response> {
  const collectorUrl = process.env.COLLECTOR_URL;

  if (collectorUrl) {
    try {
      const body = await request.text();
      // Fire-and-forget with a short timeout; errors are intentionally swallowed.
      void fetch(`${collectorUrl.replace(/\/$/, "")}/a`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: AbortSignal.timeout(3000),
      }).catch(() => undefined);
    } catch {
      // fail-open
    }
  }

  return new Response(null, { status: 202 });
}
