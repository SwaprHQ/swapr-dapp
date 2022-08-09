import { parseUnits } from '@ethersproject/units'
import { CurrencyAmount, USD } from '@swapr/sdk'

import { gql, useQuery } from '@apollo/client'
import Decimal from 'decimal.js-light'
import { DateTime } from 'luxon'
import { useMemo } from 'react'

import { subgraphBlocksClients } from '../apollo/client'
import { ZERO_USD } from '../constants'
import { useActiveWeb3React } from '../hooks'
import { SWPRSupportedChains } from '../utils/chainSupportsSWPR'

const GET_BLOCK_BY_TIMESTAMP = gql`
  query getBlockFromTimestamp($timestamp: String!) {
    blocks(first: 10, orderBy: number, orderDirection: asc, where: { timestamp_gt: $timestamp }) {
      number
    }
  }
`

const TOKEN_TOTAL_VOLUME = gql`
  query tokenTotalVolume($pairOrTokenAddress: String!) {
    tokens(first: 1, where: { id: $pairOrTokenAddress }) {
      tradeVolumeUSD
    }
  }
`

const TOKEN_TOTAL_VOLUME_TILL_BLOCK = gql`
  query tokenVolumeTillBlock($pairOrTokenAddress: String!, $block: Int!) {
    tokens(first: 1, where: { id: $pairOrTokenAddress }, block: { number: $block }) {
      tradeVolumeUSD
    }
  }
`

const PAIR_TOTAL_VOLUME = gql`
  query pairTotalVolume($pairOrTokenAddress: String!) {
    pairs(first: 1, where: { id: $pairOrTokenAddress }) {
      volumeUSD
    }
  }
`

const PAIR_VOLUME_TILL_BLOCK = gql`
  query pairVolumeTillBlock($pairOrTokenAddress: String!, $block: Int!) {
    pairs(first: 1, where: { id: $pairOrTokenAddress }, block: { number: $block }) {
      volumeUSD
    }
  }
`

function useBlockByTimestamp(timestamp: string) {
  const { chainId } = useActiveWeb3React()

  const { loading, data, error } = useQuery(GET_BLOCK_BY_TIMESTAMP, {
    client: subgraphBlocksClients[chainId as SWPRSupportedChains],
    variables: {
      timestamp: timestamp,
    },
  })

  return useMemo(() => {
    if (loading) return { loading: true, block: 0 }
    if (!data || error) return { loading: false, block: 0, error: error }
    return {
      loading,
      block: parseInt(data.blocks[0].number, 10),
    }
  }, [data, error, loading])
}

export function usePair24hVolumeUSD(
  pairOrTokenAddress?: string | null,
  isToken = false
): { loading: boolean; volume24hUSD: CurrencyAmount } {
  const timestamp24hAgo = DateTime.now().minus({ days: 1 }).toSeconds().toFixed()

  const { block, loading: blockLoading, error: blockError } = useBlockByTimestamp(timestamp24hAgo)

  const {
    data: volumeTill24agoData,
    loading: volumeTill24agoLoading,
    error: volumeTill24agoError,
  } = useQuery(isToken ? TOKEN_TOTAL_VOLUME_TILL_BLOCK : PAIR_VOLUME_TILL_BLOCK, {
    variables: {
      pairOrTokenAddress: pairOrTokenAddress?.toLowerCase(),
      block: block,
    },
  })

  const {
    data: totalVolumeData,
    loading: totalVolumeLoading,
    error: totalVolumeError,
  } = useQuery(isToken ? TOKEN_TOTAL_VOLUME : PAIR_TOTAL_VOLUME, {
    variables: {
      pairOrTokenAddress: pairOrTokenAddress?.toLowerCase(),
    },
  })

  const volume24hAgoPairs = () => totalVolumeData?.pairs[0]?.volumeUSD - volumeTill24agoData?.pairs[0]?.volumeUSD
  const volume24hAgoTokens = () =>
    totalVolumeData?.tokens[0]?.tradeVolumeUSD - volumeTill24agoData?.tokens[0]?.tradeVolumeUSD
  const volume24hAgo = isToken ? volume24hAgoTokens() : volume24hAgoPairs()

  return useMemo(() => {
    if (volumeTill24agoLoading || totalVolumeLoading || blockLoading) return { loading: true, volume24hUSD: ZERO_USD }
    if (
      !volumeTill24agoData ||
      !totalVolumeData ||
      volumeTill24agoData.pairs.length === 0 ||
      totalVolumeData.pairs.length === 0 ||
      volumeTill24agoError ||
      totalVolumeError ||
      blockError
    )
      return { loading: false, volume24hUSD: ZERO_USD }
    return {
      loading: false,
      volume24hUSD: CurrencyAmount.usd(
        parseUnits(new Decimal(volume24hAgo).toFixed(USD.decimals), USD.decimals).toString()
      ),
    }
  }, [
    volumeTill24agoData,
    totalVolumeData,
    totalVolumeError,
    volumeTill24agoError,
    volumeTill24agoLoading,
    totalVolumeLoading,
    volume24hAgo,
    blockLoading,
    blockError,
  ])
}
