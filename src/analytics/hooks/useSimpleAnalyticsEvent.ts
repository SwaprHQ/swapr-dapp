import { useAnalytics } from './analytics.hooks'

export const useSimpleAnalyticsEvent = () => {
  const { site, fathom } = useAnalytics()

  const trackEvent = (eventName: string) => {
    if (!site || !window.fathom) {
      return console.error('Fathom site not found', { site, fathom: window.fathom })
    }

    const eventId = site.events.find(({ name }) => name === eventName)?.id

    if (!eventId) {
      return console.error(`Event ID for (${eventName}) not found in site (${site.siteId})`)
    }

    fathom.trackGoal(eventId, 0)
  }

  return trackEvent
}
