export type TrackingConsent = {
  analytics: boolean
  marketing: boolean
} | null

export function trackingLoadState(consent: TrackingConsent) {
  return {
    analytics: consent?.analytics === true,
    marketing: consent?.marketing === true,
  }
}
