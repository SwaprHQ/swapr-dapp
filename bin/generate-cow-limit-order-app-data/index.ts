import { AppDataDoc, CowSdk, IpfsHashInfo } from '@cowprotocol/cow-sdk'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

export interface GnosisProtocolMetadata {
  ipfsHashInfo: IpfsHashInfo
  content: AppDataDoc
}

const argv = yargs(hideBin(process.argv))
  .option('pinata-api-key', {
    type: 'string',
    requiresArg: true,
    describe: 'Pinata API key',
  })
  .option('pinata-api-secret', {
    type: 'string',
    requiresArg: true,
    describe: 'Pinata API secret',
  })
  .env(true)
  .demandOption('pinata-api-key')
  .demandOption('pinata-api-secret').argv

export const dxdaoTreasuryAddress: Record<number, string> = {
  1: '0x519b70055af55A007110B4Ff99b0eA33071c720a',
  100: '0xe716ec63c5673b3a4732d22909b38d779fa47c3f',
} as const

interface GetOrderMetadataParams {
  chainId: number
  pinataApiKey: string
  pinataApiSecret: string
}

/**
 * Returns the Gnosis Protocol metadata all given network IDs
 * @returns
 */
export async function getOrderMetadata({
  chainId,
  pinataApiKey,
  pinataApiSecret,
}: GetOrderMetadataParams): Promise<GnosisProtocolMetadata> {
  const appCode = 'Swapr Limit Orders' // default
  const cowSdkInstance = new CowSdk(chainId, {
    ipfs: {
      pinataApiKey,
      pinataApiSecret,
    },
  })

  const content = await cowSdkInstance.metadataApi.generateAppDataDoc(
    {
      referrer: {
        address: dxdaoTreasuryAddress[chainId],
        version: '0.1.0',
      },
    },
    {
      appCode,
    }
  )
  const ipfsHashInfo = (await cowSdkInstance.metadataApi.calculateAppDataHash(content)) as IpfsHashInfo
  await cowSdkInstance.metadataApi.uploadMetadataDocToIpfs(content)

  return {
    ipfsHashInfo,
    content,
  }
}

export async function main() {
  const pinataApiKey = argv['pinata-api-key']
  const pinataApiSecret = argv['pinata-api-secret']
  const chainIds = [1, 100]
  const promises = await chainIds.map(async chainId => ({
    chainId,
    metadata: await getOrderMetadata({
      chainId,
      pinataApiKey,
      pinataApiSecret,
    }),
  }))

  const fileContent: Record<number, GnosisProtocolMetadata> = {}

  for (const { chainId, metadata } of await Promise.all(promises)) {
    fileContent[chainId] = metadata
  }

  const directoryAbsolutePath = './src/pages/Swap/LimitOrderBox/generated/cow-app-data'
  await mkdir(directoryAbsolutePath, { recursive: true })
  const fileAbsolutePath = join(directoryAbsolutePath, '/app-data.json')
  const fileContentString = JSON.stringify(fileContent, null, 2)

  await writeFile(fileAbsolutePath, fileContentString)

  console.log(`Generated ${fileAbsolutePath}`)
}

if (require.main === module) {
  main().catch(err => {
    console.error(err)
    process.exit(1)
  })
}
