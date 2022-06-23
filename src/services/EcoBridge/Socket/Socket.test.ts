import { ChainId, Currency, WETH } from '@swapr/sdk'

import { DAI, MATIC, SOCKET_NATIVE_TOKEN_ADDRESS, USDC } from '../../../constants'
import { overrideTokensAddresses } from './Socket.utils'

describe('overrideTokensAddresses', () => {
  const ETH = Currency.getNative(ChainId.MAINNET) //Same for mainnet & arbitrum
  const XDAI = Currency.getNative(ChainId.XDAI)
  const MATIC_Native = Currency.getNative(ChainId.POLYGON)

  let baseParams: Record<'fromChainId' | 'toChainId', ChainId>

  // Mainnet-Arbitrum - no overrides

  it('overrides on MAINNET-GNOSIS', () => {
    // Mainnet-Gnosis
    baseParams = {
      fromChainId: ChainId.MAINNET,
      toChainId: ChainId.XDAI,
    }

    // Mainnet ETH => WETH Gnosis
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: ETH.symbol! })).toEqual({
      fromTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
      toTokenAddressOverride: WETH[ChainId.XDAI].address,
    })

    // Mainnet DAI => XDAI Gnosis
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: DAI[ChainId.MAINNET].address })).toEqual({
      fromTokenAddressOverride: DAI[ChainId.MAINNET].address,
      toTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
    })

    // Mainnet USDC => USDC Gnosis (no substitution)
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: USDC[ChainId.MAINNET].address })).toBeUndefined()

    // Gnosis-Mainnet
    baseParams = {
      fromChainId: ChainId.XDAI,
      toChainId: ChainId.MAINNET,
    }

    // Gnosis WETH => ETH Mainnet
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: WETH[ChainId.XDAI].address })).toEqual({
      fromTokenAddressOverride: WETH[ChainId.XDAI].address,
      toTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
    })

    // Gnosis XDAI => DAI Mainnet
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: XDAI.symbol! })).toEqual({
      fromTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
      toTokenAddressOverride: DAI[ChainId.MAINNET].address,
    })

    // Gnosis USDC => USDC Gnosis (no substitution)
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: USDC[ChainId.MAINNET].address })).toBeUndefined()
  })

  it('overrides on MAINNET-POLYGON', () => {
    // Mainnet-Polygon
    baseParams = {
      fromChainId: ChainId.MAINNET,
      toChainId: ChainId.POLYGON,
    }
    // Mainnet ETH => WETH Polygon
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: ETH.symbol! })).toEqual({
      fromTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
      toTokenAddressOverride: WETH[ChainId.POLYGON].address,
    })

    // Mainnet MATIC (Token) => MATIC Polygon
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: MATIC[ChainId.MAINNET].address })).toEqual({
      fromTokenAddressOverride: MATIC[ChainId.MAINNET].address,
      toTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
    })

    // Mainnet USDC => USDC Polygon (no substitution)
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: USDC[ChainId.MAINNET].address })).toBeUndefined()

    // Polygon-Mainnet
    baseParams = {
      fromChainId: ChainId.POLYGON,
      toChainId: ChainId.MAINNET,
    }

    // Polygon WETH => ETH Mainnet
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: WETH[ChainId.POLYGON].address })).toEqual({
      fromTokenAddressOverride: WETH[ChainId.POLYGON].address,
      toTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
    })

    // Polygon MATIC => MATIC (Token) Mainnet
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: MATIC_Native.symbol! })).toEqual({
      fromTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
      toTokenAddressOverride: MATIC[ChainId.MAINNET].address,
    })

    // Polygon USDC => USDC Mainnet (no substitution)
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: USDC[ChainId.POLYGON].address })).toBeUndefined()
  })

  it('overrides on GNOSIS-POLYGON', () => {
    // Gnosis-Polygon
    baseParams = {
      fromChainId: ChainId.XDAI,
      toChainId: ChainId.POLYGON,
    }
    // Gnosis XDAI => DAI Polygon
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: XDAI.symbol! })).toEqual({
      fromTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
      toTokenAddressOverride: DAI[ChainId.POLYGON].address,
    })

    // Gnosis MATIC (Token) => MATIC Polygon
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: MATIC[ChainId.XDAI].address })).toEqual({
      fromTokenAddressOverride: MATIC[ChainId.XDAI].address,
      toTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
    })

    // Gnosis USDC => USDC Polygon (no substitution)
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: USDC[ChainId.XDAI].address })).toBeUndefined()

    // Polygon-Gnosis
    baseParams = {
      fromChainId: ChainId.POLYGON,
      toChainId: ChainId.XDAI,
    }

    // Polygon DAI => XDAI Gnosis
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: DAI[ChainId.POLYGON].address })).toEqual({
      fromTokenAddressOverride: DAI[ChainId.POLYGON].address,
      toTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
    })

    // Polygon MATIC => MATIC (Token) Mainnet
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: MATIC_Native.symbol! })).toEqual({
      fromTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
      toTokenAddressOverride: MATIC[ChainId.XDAI].address,
    })

    // Polygon USDC => USDC Mainnet (no substitution)
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: USDC[ChainId.POLYGON].address })).toBeUndefined()
  })

  it('overrides on GNOSIS-ARBITRUM', () => {
    // Gnosis - Arbitrum
    baseParams = {
      fromChainId: ChainId.XDAI,
      toChainId: ChainId.ARBITRUM_ONE,
    }
    // Gnosis XDAI => DAI Arbitrum
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: XDAI.symbol! })).toEqual({
      fromTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
      toTokenAddressOverride: DAI[ChainId.ARBITRUM_ONE].address,
    })

    // Gnosis WETH => ETH Arbitrum
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: WETH[ChainId.XDAI].address })).toEqual({
      fromTokenAddressOverride: WETH[ChainId.XDAI].address,
      toTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
    })

    // Mainnet USDC => USDC Polygon (no substitution)
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: USDC[ChainId.XDAI].address })).toBeUndefined()

    // Arbitrum-Gnosis
    baseParams = {
      fromChainId: ChainId.ARBITRUM_ONE,
      toChainId: ChainId.XDAI,
    }

    // Arbitrum ETH => WETH Gnosis
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: ETH.symbol! })).toEqual({
      fromTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
      toTokenAddressOverride: WETH[ChainId.XDAI].address,
    })

    // Arbitrum DAI => XDAI Gnosis
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: DAI[ChainId.ARBITRUM_ONE].address })).toEqual({
      fromTokenAddressOverride: DAI[ChainId.ARBITRUM_ONE].address,
      toTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
    })

    // Polygon USDC => USDC Mainnet (no substitution)
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: USDC[ChainId.ARBITRUM_ONE].address })).toBeUndefined()
  })

  it('overrides on POLYGON-ARBITRUM', () => {
    // Polygon-Arbitrum
    baseParams = {
      fromChainId: ChainId.POLYGON,
      toChainId: ChainId.ARBITRUM_ONE,
    }
    // Polygon MATIC => MATIC (Token) Arbitrum - no MATIC token added on Arb so should be undefined
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: MATIC_Native.symbol! })).toEqual({
      fromTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
      toTokenAddressOverride: '',
    })

    // Polygon WETH => ETH Arbitrum
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: WETH[ChainId.POLYGON].address })).toEqual({
      fromTokenAddressOverride: WETH[ChainId.POLYGON].address,
      toTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
    })

    // Mainnet USDC => USDC Polygon (no substitution)
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: USDC[ChainId.MAINNET].address })).toBeUndefined()

    // Arbitrum-Polygon
    baseParams = {
      fromChainId: ChainId.ARBITRUM_ONE,
      toChainId: ChainId.POLYGON,
    }

    // Arbitrum MATIC (Token) => MATIC Polygon
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: '' })).toEqual({
      fromTokenAddressOverride: '', //no MATIC token on Arb
      toTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
    })

    // Arbitrum ETH => WETH Polygon
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: ETH.symbol! })).toEqual({
      fromTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
      toTokenAddressOverride: WETH[ChainId.POLYGON].address,
    })

    // Arbitrum USDC => USDC Polygon (no substitution)
    expect(overrideTokensAddresses({ ...baseParams, fromAddress: USDC[ChainId.ARBITRUM_ONE].address })).toBeUndefined()
  })
})
