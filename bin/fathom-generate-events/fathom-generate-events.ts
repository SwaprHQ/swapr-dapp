import { RoutablePlatform, UniswapV2RoutablePlatform } from '@swapr/sdk'

import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

import { getMapOfExchanges } from './eco-router-platforms'
import { createSiteEvent, getSiteEvents } from './fathom-api'
import { generateFileContent } from './file-content-generator'

interface MainParams {
  siteId: string
  token: string
  outputDirectory: string
}

export async function main({ siteId, token, outputDirectory }: MainParams): Promise<void> {
  const platformsNames = [...getMapOfExchanges(RoutablePlatform), ...getMapOfExchanges(UniswapV2RoutablePlatform)]
  const ecoRouterVolumeUSDEventList = platformsNames.map(
    ({ networkName, platformName, networkId }) => `${networkName}-${networkId}/ecoRouter/${platformName}/volumeUSD`
  )

  // create networkId->networkName map
  const networkIdToNameMapEntries = platformsNames.reduce((acc, { networkId, networkName }) => {
    acc[networkId] = networkName
    return acc
  }, {} as Record<number, string>)

  const allSiteEvents = await getSiteEvents(siteId, token)

  const siteEventsToCreate = ecoRouterVolumeUSDEventList.filter(
    event => !allSiteEvents.find(siteEvent => siteEvent.name === event)
  )

  const siteEventsCreated: Awaited<ReturnType<typeof createSiteEvent>>[] = []

  if (siteEventsToCreate.length > 0) {
    console.log(`Creating ${siteEventsToCreate.length} events`)

    for await (const name of siteEventsToCreate) {
      try {
        const createSiteEventResponse = await createSiteEvent({ name, siteId, token })
        console.log(`[CreateSiteEvent] Created event ${name} with id ${createSiteEventResponse.id}`)
        siteEventsCreated.push(createSiteEventResponse)
      } catch (error) {
        console.error(`[CreateSiteEvent] Error creating event ${name}`, error)
      }
    }
  } else {
    console.log('No events to create')
  }

  const siteEvents = [...allSiteEvents, ...siteEventsCreated]

  // remove duplicates
  const siteEventsUnique = siteEvents.filter(
    (siteEvent, index) => siteEvents.findIndex(siteEvent2 => siteEvent2.name === siteEvent.name) === index
  )

  const generatedFileContent = generateFileContent({
    siteEvents: {
      siteId,
      events: siteEventsUnique,
      timestamp: new Date().toISOString(),
    },
    networkIdToNameMapEntries,
  })

  await mkdir(outputDirectory, { recursive: true })
  await writeFile(join(outputDirectory, 'index.ts'), generatedFileContent)
  await writeFile(
    join(outputDirectory, `fathom-events.json`),
    JSON.stringify(
      {
        siteId: siteId,
        events: siteEventsUnique,
      },
      null,
      2
    )
  )

  console.log(`[Codegen] Saved to ${outputDirectory}`)
}
