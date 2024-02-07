export interface Fathom {
  siteId: string
  blockTrackingForMe(): void
  enableTrackingForMe(): void
  setSite(siteId: string): void
  trackGoal(goalId: string, data: any): void
  trackEvent(eventName: string, opt?: { _site_id?: string; _value?: number }): void
  trackPageview(params?: Record<string, any>): void
}

declare global {
  interface Window {
    fathom: Fathom
  }
}
