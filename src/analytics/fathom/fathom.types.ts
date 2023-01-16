export interface Fathom {
  siteId: string
  blockTrackingForMe(): void
  enableTrackingForMe(): void
  setSite(siteId: string): void
  trackGoal(goalId: string, data: any): void
  trackEvent(eventId: string, payload: Record<string, any>): void
  trackPageview(params?: Record<string, any>): void
}

declare global {
  interface Window {
    fathom: Fathom
  }
}
