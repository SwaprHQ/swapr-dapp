import { formatDistance } from 'date-fns'

export const formatDistanceDate = (timestamp: number) => {
  try {
    return formatDistance(new Date(timestamp), new Date(), {
      addSuffix: false,
    })
  } catch {
    return '-'
  }
}
