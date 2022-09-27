import fetch from 'node-fetch'

interface GetSiteEventsResponse {
  object: string
  url: string
  has_more: boolean
  data: SiteEvent[]
}

export interface SiteEvent {
  id: string
  object: 'event'
  name: string
  currency: string | null
  created_at: string
}

export async function getSiteEvents(siteId: string, token: string): Promise<SiteEvent[]> {
  let allEventList: SiteEvent[] = []
  let lastItem: string | undefined
  let hasMoreItems = false

  const getEvents = async (): Promise<SiteEvent[]> => {
    const url = new URL(`https://api.usefathom.com/v1/sites/${siteId}/events`)
    url.searchParams.set('limit', '100')

    if (lastItem) {
      url.searchParams.set('starting_after', lastItem)
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const responseJson = (await response.json()) as GetSiteEventsResponse

    allEventList = [...allEventList, ...responseJson.data]
    hasMoreItems = responseJson.has_more

    if (hasMoreItems) {
      lastItem = responseJson.data[responseJson.data.length - 1]?.id
      return getEvents()
    }

    return allEventList
  }

  await getEvents()

  return allEventList
}

interface CreateSiteEventParams {
  siteId: string
  token: string
  name: string
}

export function createSiteEvent({ name, siteId, token }: CreateSiteEventParams): Promise<SiteEvent> {
  return fetch(`https://api.usefathom.com/v1/sites/${siteId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
    }),
  }).then(response => response.json() as Promise<SiteEvent>)
}
