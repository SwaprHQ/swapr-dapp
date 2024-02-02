// used to mark unsupported tokens, these are hosted lists of unsupported tokens

import { DEFAULT_TOKEN_LIST } from '.'

const COMPOUND_LIST = 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json'
const UMA_LIST = 'https://umaproject.org/uma.tokenlist.json'
const AAVE_LIST = 'tokenlist.aave.eth'
const SYNTHETIX_LIST = 'synths.snx.eth'
const WRAPPED_LIST = 'wrapped.tokensoft.eth'
const SET_LIST = 'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json'
const ROLL_LIST = 'https://app.tryroll.com/tokens.json'
const COINGECKO_LIST = 'https://tokens.coingecko.com/uniswap/all.json'
const CMC_ALL_LIST = 'defi.cmc.eth'
const CMC_STABLECOIN = 'stablecoin.cmc.eth'
const KLEROS_LIST = 'https://t2crtokens.eth.limo/'
const GEMINI_LIST = 'https://www.gemini.com/uniswap/manifest.json'
const BA_LIST = 'https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json'
const HONEYSWAP_LIST = 'https://tokens.honeyswap.org'
const LEVINSWAP_LIST =
  'https://ipfs.io/ipfs/QmUWxthidUYXUJ2kiZLLPxkMKYDAinnpA591R3SRN6wufs?filename=levinswap-default.tokenlist.json'
const BAOSWAP_LIST = 'https://raw.githubusercontent.com/baofinance/tokenlists/main/xdai.json'
const QUICKSWAP_LIST = 'https://unpkg.com/quickswap-default-token-list@1.2.29/build/quickswap-default.tokenlist.json'
const DFYN_LIST = 'https://raw.githubusercontent.com/dfyn/new-host/main/list-token.tokenlist.json'
const OPTIMISM_LIST = 'https://static.optimism.io/optimism.tokenlist.json'
const PANCAKESWAP_LIST =
  'https://raw.githubusercontent.com/pancakeswap/pancake-toolkit/master/packages/token-lists/lists/pancakeswap-default.json'
// const UNISWAP_LIST = 'https://tokens.coingecko.com/uniswap/all.json'
const ARBITRUM_LIST = 'https://tokens.coingecko.com/arbitrum-one/all.json'
const SCROLL_LIST = 'https://raw.githubusercontent.com/scroll-tech/token-list/main/scroll.tokenlist.json'
export const ZK_SYNC_ERA_LIST = 'https://tokens.coingecko.com/zksync/all.json'

export const UNSUPPORTED_LIST_URLS: string[] = [BA_LIST]

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS: string[] = [
  AAVE_LIST,
  ARBITRUM_LIST,
  BAOSWAP_LIST,
  COINGECKO_LIST,
  CMC_ALL_LIST,
  CMC_STABLECOIN,
  COMPOUND_LIST,
  DEFAULT_TOKEN_LIST,
  DFYN_LIST,
  GEMINI_LIST,
  HONEYSWAP_LIST,
  KLEROS_LIST,
  LEVINSWAP_LIST,
  OPTIMISM_LIST,
  PANCAKESWAP_LIST,
  QUICKSWAP_LIST,
  ROLL_LIST,
  SCROLL_LIST,
  SET_LIST,
  SYNTHETIX_LIST,
  UMA_LIST,
  // UNISWAP_LIST,
  WRAPPED_LIST,
  ZK_SYNC_ERA_LIST,
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
]

// default lists to be 'active' aka searched across
// TODO: Generalise this to have a dict of (chainId: active_list)
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [
  DEFAULT_TOKEN_LIST,
  'CARROT',
  QUICKSWAP_LIST,
  OPTIMISM_LIST,
  PANCAKESWAP_LIST,
  // UNISWAP_LIST,
  ARBITRUM_LIST,
  ZK_SYNC_ERA_LIST,
]
