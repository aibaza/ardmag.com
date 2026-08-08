// First-party analytics endpoint: receives beacon events from the browser
// (same-origin POST, adblock-resistant) and forwards them server-side to the
// central portfolio collector (Cloudflare Worker + Analytics Engine).
//
// Fail-open by design: when COLLECTOR_URL is unset or the collector is down,
// we still return 202 - the product never depends on analytics.
//
// The forward MUST be awaited: a Vercel serverless function can freeze/
// terminate execution right after the Response is returned, so a detached
// (un-awaited) fetch here has no guarantee of ever completing. Verified live
// 2026-08-08 - un-awaited forwards were silently dropped (202 returned, no
// row ever landed in Analytics Engine), which explains months of missing
// anon_id/traffic_class on browser-originated events for this brand.

export async function POST(request: Request): Promise<Response> {
  const collectorUrl = process.env.COLLECTOR_URL;

  if (collectorUrl) {
    try {
      const body = await request.text();
      await fetch(`${collectorUrl.replace(/\/$/, "")}/a`, {
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
