import { TokenInfo, TokenList } from '@uniswap/token-lists'
import schema from '@uniswap/token-lists/src/tokenlist.schema.json'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

import { ZK_SYNC_ERA_LIST } from '../constants/lists'
import { ADDRESS_REGEX } from '../state/swap/hooks'

import contenthashToUri from './contenthashToUri'
import { parseENSAddress } from './parseENSAddress'
import uriToHttp from './uriToHttp'

const ajv = new Ajv({ allErrors: false })
addFormats(ajv)
const tokenListValidator = ajv.compile(schema)

/**
 * Note: these types are used for a hacky way to hotfix
 * Coingecko's bad JSON data shape for token addresses
 * in zkSync Era. We override readonly properties for this purpose.
 * If they fix the token addresses format, please revert this commit.
 */
type FormattableTokenInfo = Omit<TokenInfo, 'address'> & {
  address: string
}

type FormattableTokenList = Omit<TokenList, 'tokens'> & {
  tokens: FormattableTokenInfo[]
}

/**
 * Contains the logic for resolving a list URL to a validated token list
 * @param listUrl list url
 * @param resolveENSContentHash resolves an ens name to a contenthash
 */
export default async function getTokenList(
  listUrl: string,
  resolveENSContentHash: (ensName: string) => Promise<string>
): Promise<TokenList> {
  const parsedENS = parseENSAddress(listUrl)
  let urls: string[]
  if (parsedENS) {
    let contentHashUri
    try {
      contentHashUri = await resolveENSContentHash(parsedENS.ensName)
    } catch (error) {
      console.debug(`Failed to resolve ENS name: ${parsedENS.ensName}`, error)
      throw new Error(`Failed to resolve ENS name: ${parsedENS.ensName}`)
    }
    let translatedUri
    try {
      translatedUri = contenthashToUri(contentHashUri)
    } catch (error) {
      console.debug('Failed to translate contenthash to URI', contentHashUri)
      throw new Error(`Failed to translate contenthash to URI: ${contentHashUri}`)
    }
    urls = uriToHttp(`${translatedUri}${parsedENS.ensPath ?? ''}`)
  } else {
    urls = uriToHttp(listUrl)
  }
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const isLast = i === urls.length - 1
    let response
    try {
      response = await fetch(url, { credentials: 'omit' })
    } catch (error) {
      console.debug('Failed to fetch list', listUrl, error)
      if (isLast) throw new Error(`Failed to download list ${listUrl}`)
      continue
    }

    if (!response.ok) {
      if (isLast) throw new Error(`Failed to download list ${listUrl}`)
      continue
    }

    const json: FormattableTokenList = await response.json()

    /**
     * Note: this is a hacky way to override wrong data shape comming from
     * Coingecko's zkSync token list. We will try to contact them so they
     * can fix the data shape in the JSON response, meanwhile, this is a
     * hotfix.
     * If they fix the token addresses format, please revert this commit.
     */
    if (url === ZK_SYNC_ERA_LIST) {
      json.tokens?.forEach(token => {
        const address = token.address
        const CONTAINS_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}/

        /**
         * if the address contains an EVM address but also other characters
         * at the end, we drop the exceeding characters
         */
        if (CONTAINS_ADDRESS_REGEX.test(address) && !ADDRESS_REGEX.test(address)) token.address = address.slice(0, 42)
      })
      console.log('tokens value: ', json.tokens)
    }

    if (!tokenListValidator(json)) {
      const validationErrors: string =
        tokenListValidator.errors?.reduce<string>((memo, error) => {
          const add = `${error.schemaPath} ${error.message ?? ''}`
          return memo.length > 0 ? `${memo}; ${add}` : `${add}`
        }, '') ?? 'unknown error'

      throw new Error(`Token list failed validation: ${validationErrors}`)
    }
    return json
  }
  throw new Error('Unrecognized list URL protocol.')
}
