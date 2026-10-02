/** Deployment-local overrides isolate catalog previews from production credentials. */
const stagingPreview = process.env.VERCEL_ENV === "preview" && Boolean(process.env.STAGING_MEDUSA_BACKEND_URL)

export const medusaBackendUrl = stagingPreview
  ? process.env.STAGING_MEDUSA_BACKEND_URL!
  : process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export const medusaPublishableKey = stagingPreview
  ? process.env.STAGING_MEDUSA_PUBLISHABLE_KEY
  : process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

if (stagingPreview && (!medusaPublishableKey || new URL(medusaBackendUrl).hostname !== "medusa-staging-a4fc.up.railway.app")) {
  throw new Error("Catalog staging preview requires its isolated backend and publishable key")
}
