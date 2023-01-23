import { SiteEvent } from './fathom-api'

export interface GenerateFileContentParams {
  siteEvents: {
    siteId: string
    events: SiteEvent[]
    timestamp: string
  }
  networkIdToNameMapEntries: Record<number, string>
}

export function generateFileContent({ siteEvents, networkIdToNameMapEntries }: GenerateFileContentParams): string {
  const generatedFileContent = `/*
* This file is autogenerated, do NOT edit
*/
export type FathomRegisteredEventName = ${siteEvents.events.map(siteEvent => `'${siteEvent.name}'`).join(' | ')};
export type FathomRegisteredNetworkName = ${Object.values(networkIdToNameMapEntries)
    .map(networkName => `'${networkName}'`)
    .join(' | ')};

export interface FathomSiteEvent {
  id: string;
  object: 'event';
  name: FathomRegisteredEventName;
  currency: string | null
  created_at: string;
}

export interface FathomSiteInformation {
  siteId: string;
  events: FathomSiteEvent[];
  timestamp: string;
}

/**
 * Site information and events
 */
export const siteEvents: FathomSiteInformation = ${JSON.stringify(siteEvents, null, 2)};

/**
 * Get site event by name
 */
export function getEventId(event: FathomRegisteredEventName): string | undefined {
  return siteEvents.events.find(siteEvent => siteEvent.name === event)?.id;
}

/**
 * Map of networkId to network name
 */
export const networkIdToNameMap: Record<number, string> = ${JSON.stringify(networkIdToNameMapEntries, null, 2)};

/**
 * Returns network name using chainId
 */
export function getNetworkNameByChainId(chainId: number): string {
  return networkIdToNameMap[chainId];
}

/**
 * Constructs EcoRouter volumeUSD event name
 */
export function getEcoRouterVolumeUSDEventName(networkName: string, networkId: number, platformName: string): string {
    return \`\${networkName.toLowerCase()}-\${networkId}/ecoRouter/\${platformName.toLowerCase()}/volumeUSD\`;
}

/**
 * Constructs EcoBridge volumeUSD event name for a given platform, from network and to network
 */
export function getEcoBridgeVolumeUSDEventName(
  platformName: string,
  fromNetworkId: number,
  toNetworkId: number
): string {
  const fromNetworkName = getNetworkNameByChainId(fromNetworkId)
  const toNetworkName = getNetworkNameByChainId(toNetworkId)
  platformName = platformName.replace(/:/g, '-').toLowerCase()
  return \`\${fromNetworkName}-\${fromNetworkId}/ecoBridge/\${platformName}/\${toNetworkName}-\${toNetworkId}/volumeUSD\`;
}
`

  return generatedFileContent
}
