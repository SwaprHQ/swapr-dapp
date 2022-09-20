import { CurrencyAmount, Pair, Price, Token } from '@swapr/sdk'

import { useEffect, useState } from 'react'

import { usePair24hVolumeUSD } from '../../hooks/usePairVolume24hUSD'
import { useCoingeckoUSDPrice } from '../../hooks/useUSDValue'

type ActiveCurrencyDetails = {
  price: string | undefined
  volume24h: string | undefined
  relativePrice: number | undefined
}

const calculate24hVolumeForActiveCurrencyOption = (volume24hUSD: CurrencyAmount, price: Price) =>
  volume24hUSD.divide(price.toFixed(0)).toFixed(0)

export const usePairDetails = (token0?: Token, token1?: Token, activeCurrencyOption?: Token) => {
  const [pairAddress, setPairAddress] = useState('')

  useEffect(() => {
    if (token0 && token1) {
      setPairAddress(Pair.getAddress(token0, token1))
    }
  }, [token0, token1])

  const { loading: isLoadingVolume24hUSD, volume24hUSD } = usePair24hVolumeUSD(pairAddress)
  const [token0Price, token1Price] = [useCoingeckoUSDPrice(token0), useCoingeckoUSDPrice(token1)]

  const [isPairModalOpen, setIsPairModalOpen] = useState(false)

  const [activeCurrencyDetails, setActiveCurrencyDetails] = useState<ActiveCurrencyDetails>({
    price: undefined,
    volume24h: undefined,
    relativePrice: undefined,
  })

  const handleOpenModal = () => {
    setIsPairModalOpen(true)
  }

  const onDismiss = () => {
    setIsPairModalOpen(false)
  }

  const onPairSelect = () => {
    // @TODO implement it
  }

  useEffect(() => {
    if (
      !isLoadingVolume24hUSD &&
      volume24hUSD &&
      token0Price.price &&
      token1Price.price &&
      activeCurrencyOption &&
      token0
    ) {
      if (token0.address.toLowerCase() === activeCurrencyOption.address.toLowerCase()) {
        setActiveCurrencyDetails({
          price: token1Price.price.toFixed(0),
          volume24h: calculate24hVolumeForActiveCurrencyOption(volume24hUSD, token0Price.price),
          relativePrice: Number(token1Price.price.toFixed(0)) / Number(token0Price.price.toFixed(0)),
        })
      } else {
        setActiveCurrencyDetails({
          price: token0Price.price.toFixed(0),
          volume24h: calculate24hVolumeForActiveCurrencyOption(volume24hUSD, token1Price.price),
          relativePrice: Number(token0Price.price.toFixed(0)) / Number(token1Price.price.toFixed(0)),
        })
      }
    }
  }, [
    isLoadingVolume24hUSD,
    volume24hUSD,
    activeCurrencyOption?.address,
    token0?.address,
    token0Price.price,
    token1Price.price,
    token1Price,
    activeCurrencyOption,
    token0,
  ])

  return {
    onDismiss,
    onPairSelect,
    handleOpenModal,
    isPairModalOpen,
    isLoadingVolume24hUSD,
    volume24hUSD,
    activeCurrencyDetails,
  }
}
