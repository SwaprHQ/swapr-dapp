import { CurrencyAmount, Pair, Price, Token } from '@swapr/sdk'

import { useEffect, useState } from 'react'

import { usePair24hVolumeUSD } from '../../hooks/usePairVolume24hUSD'
import { useCoingeckoUSDPrice } from '../../hooks/useUSDValue'

type ActiveCurrencyDetails = {
  price: string | undefined
  volume24h: string | undefined
  relativePrice: number | undefined
  priceChange24h: string | undefined
  percentPriceChange24h: string | undefined
  isIncome24h: boolean | undefined
}

const calculate24hVolumeForActiveCurrencyOption = (volume24hUSD: CurrencyAmount, price: Price) => {
  try {
    return volume24hUSD.divide(price.toFixed(0)).toFixed(0)
  } catch (e) {
    return '0'
  }
}

const calculateUSDChange24h = (price: Price, priceChange24h: Price, isIncome24h: boolean) => {
  return isIncome24h ? price.subtract(priceChange24h) : price.add(priceChange24h)
}

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
    priceChange24h: undefined,
    percentPriceChange24h: undefined,
    isIncome24h: undefined,
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
      token0Price.priceChange24h &&
      token0Price.isIncome24h !== undefined &&
      token1Price.price &&
      token1Price.priceChange24h &&
      token1Price.isIncome24h !== undefined &&
      activeCurrencyOption &&
      token0
    ) {
      const token1Price24h = calculateUSDChange24h(
        token1Price.price,
        token1Price.priceChange24h,
        token1Price.isIncome24h
      )
      const token0Price24h = calculateUSDChange24h(
        token0Price.price,
        token0Price.priceChange24h,
        token0Price.isIncome24h
      )

      if (token0.address.toLowerCase() === activeCurrencyOption.address.toLowerCase()) {
        const relativePrice = token1Price.price.divide(token0Price.price)
        const relativePrice24h = token1Price24h.divide(token0Price24h)
        setActiveCurrencyDetails({
          price: token1Price.price.toFixed(2),
          priceChange24h: Math.abs(Number(relativePrice24h.subtract(relativePrice).toFixed(2))).toString(),
          percentPriceChange24h: Math.abs(
            Number(relativePrice24h.subtract(relativePrice).divide(relativePrice24h).multiply(BigInt(100)).toFixed(2))
          ).toString(),
          isIncome24h: relativePrice24h < relativePrice,
          volume24h: calculate24hVolumeForActiveCurrencyOption(volume24hUSD, token0Price.price),
          relativePrice: Number(relativePrice.toFixed(2)),
        })
      } else {
        const relativePrice = token0Price.price.divide(token1Price.price)
        const relativePrice24h = token0Price24h.divide(token1Price24h)
        setActiveCurrencyDetails({
          price: token0Price.price.toFixed(2),
          priceChange24h: Math.abs(Number(relativePrice24h.subtract(relativePrice).toFixed(2))).toString(),
          percentPriceChange24h: Math.abs(
            Number(relativePrice24h.subtract(relativePrice).divide(relativePrice24h).multiply(BigInt(100)).toFixed(2))
          ).toString(),
          isIncome24h: relativePrice24h < relativePrice,
          volume24h: calculate24hVolumeForActiveCurrencyOption(volume24hUSD, token1Price.price),
          relativePrice: Number(relativePrice.toFixed(2)),
        })
      }
    }
  }, [
    isLoadingVolume24hUSD,
    volume24hUSD,
    activeCurrencyOption?.address,
    token0?.address,
    token0Price.price,
    token0Price.priceChange24h,
    token0Price.isIncome24h,
    token1Price.price,
    token1Price.priceChange24h,
    token1Price.isIncome24h,
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
