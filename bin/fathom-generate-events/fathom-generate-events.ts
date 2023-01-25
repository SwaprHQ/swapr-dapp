import { RoutablePlatform, UniswapV2RoutablePlatform } from '@swapr/sdk'

import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

import { getChainNameByChainId } from './chain'
import { ecoBridgePlatformList } from './eco-bridge-platforms'
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
  // a metric to track ecoBridge USD volume between origin and destination chains for each bridge
  const ecoBridgeVolumeUSDEventList = ecoBridgePlatformList()
    .map(({ platformName, supportedChains }) => {
      return supportedChains
        .map(({ to, from }) => {
          const fromNetworkName = getChainNameByChainId(from)
          const toNetworkName = getChainNameByChainId(to)
          return [
            `${fromNetworkName}-${from}/ecoBridge/${platformName}/${toNetworkName}-${to}/volumeUSD`,
            `${toNetworkName}-${to}/ecoBridge/${platformName}/${fromNetworkName}-${from}/volumeUSD`,
          ]
        })
        .flat()
    })
    .flat()

  const allSiteEvents = await getSiteEvents(siteId, token)

  const siteEventsToCreate = [...ecoRouterVolumeUSDEventList, ...ecoBridgeVolumeUSDEventList].filter(
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

  // create networkId->networkName map
  const networkIdToNameMapEntries = platformsNames.reduce((acc, { networkId, networkName }) => {
    acc[networkId] = networkName
    return acc
  }, {} as Record<number, string>)

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
