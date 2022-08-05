import { formatDistance, subDays } from 'date-fns'

export const formatDate = (timestamp: number) => {
  try {
    return formatDistance(subDays(new Date(timestamp), 3), new Date(), {
      addSuffix: true,
    })
  } catch {
    return '-'
  }
}
