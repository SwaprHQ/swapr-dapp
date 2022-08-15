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

// timestamp is always changing this func rounds the time every 5 min
// eg. 17:47:34 -> 17:45:00, 17:48:00 -> 17:45:00, 17:51:00 -> 17:50:00
// that allows to only fetch data every 5 min and use cached data when in the same interval
const getDateTimeRounded5minInterval = () => {
  const dateTimeNow = DateTime.now().set({ second: 0, millisecond: 0 })
  const ROUNDING_MINUTES = 5
  const reminderMinutes = dateTimeNow.minute % ROUNDING_MINUTES
  return dateTimeNow.minus({ minutes: reminderMinutes })
}

const getTimestamp24hAgo = () => getDateTimeRounded5minInterval().minus({ days: 1 }).toSeconds().toFixed()

export function usePair24hVolumeUSD(
  pairOrTokenAddress?: string | null,
  isToken = false
): { loading: boolean; volume24hUSD: CurrencyAmount } {
  const { block, loading: blockLoading, error: blockError } = useBlockByTimestamp(getTimestamp24hAgo())

  const {
    data: volume24hUsdData,
    loading: volume24hUsdLoading,
    error: volume24hUsdError,
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

  const volume24hAgoPairs = () => totalVolumeData?.pairs[0]?.volumeUSD - volume24hUsdData?.pairs[0]?.volumeUSD
  const volume24hAgoTokens = () =>
    totalVolumeData?.tokens[0]?.tradeVolumeUSD - volume24hUsdData?.tokens[0]?.tradeVolumeUSD
  const volume24hAgo = isToken ? volume24hAgoTokens() : volume24hAgoPairs()

  return useMemo(() => {
    if (volume24hUsdLoading || totalVolumeLoading || blockLoading) return { loading: true, volume24hUSD: ZERO_USD }
    if (
      !volume24hUsdData ||
      !totalVolumeData ||
      !volume24hUsdData.pairs.length ||
      !totalVolumeData.pairs.length ||
      volume24hUsdError ||
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
    volume24hUsdData,
    totalVolumeData,
    totalVolumeError,
    volume24hUsdError,
    volume24hUsdLoading,
    totalVolumeLoading,
    volume24hAgo,
    blockLoading,
    blockError,
  ])
}
