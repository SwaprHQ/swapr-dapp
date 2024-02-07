import { useAnalytics } from './analytics.hooks'

export const useSimpleAnalyticsEvent = () => {
  const { site } = useAnalytics()

  const trackEvent = (eventName: string, opt?: { _site_id: string; _value: number }) => {
    if (!site || !window.fathom) {
      return console.error('Fathom site not found', { site, fathom: window.fathom })
    }

    window.fathom.trackEvent(eventName, opt)
  }

  return trackEvent
}
