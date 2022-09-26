import { formatDistance, subDays } from 'date-fns'

export const formatDistanceDate = (timestamp: number) => {
  try {
    return formatDistance(subDays(new Date(timestamp), 3), new Date(), {
      addSuffix: false,
    })
  } catch {
    return '-'
  }
}
