import { CurrencyAmount, Pair, Price, Token } from '@swapr/sdk'

import { useEffect, useState } from 'react'

import { ZERO_USD } from '../../constants'
import { usePair24hVolumeUSD } from '../../hooks/usePairVolume24hUSD'
import { useCoingeckoUSDPrice } from '../../hooks/useUSDValue'

type ActiveCurrencyDetails = {
  price: string
  volume24h: string
  relativePrice: string
  priceChange24h: string
  percentPriceChange24h: string
  isIncome24h: boolean
}

const calculate24hVolumeForActiveCurrencyOption = (
  volume24hUSD: CurrencyAmount,
  price: Price,
  activeCurrencyOption: Token | undefined
) => {
  try {
    if (volume24hUSD === ZERO_USD) throw new Error('Advanced Trading View: cannot fetch volume24h')

    return `${Number(volume24hUSD.divide(price).toSignificant(6)).toFixed(2)} ${activeCurrencyOption?.symbol ?? ''}`
  } catch {
    return '-'
  }
}

const calculateUSDChange24h = (price: Price, priceChange24h: Price, isIncome24h: boolean) => {
  return isIncome24h
    ? Number(price.toFixed(6)) - Number(priceChange24h.toFixed(6))
    : Number(price.toFixed(6)) + Number(priceChange24h.toFixed(6))
}

const calculatePrices = (relativePrice: number, token0Price24h: number, token1Price24h: number, symbol: string) => {
  const relativePrice24h = token1Price24h / token0Price24h
  const priceChange24h = Math.abs(Number(relativePrice.toFixed(6)) - Number(relativePrice24h.toFixed(6))).toFixed(4)
  const priceChange24hWithSymbol = `${Number(priceChange24h) !== 0 ? `${priceChange24h}` : '< 0,0001'}  ${symbol}`
  const percentPriceChange24h = Math.abs(
    ((Number(relativePrice.toFixed(6)) - Number(relativePrice24h.toFixed(6))) / Number(relativePrice.toFixed(6))) * 100
  ).toFixed(2)
  console.log('lol', relativePrice, relativePrice24h)
  const isIncome = relativePrice24h < relativePrice
  return { priceChange24hWithSymbol, percentPriceChange24h, isIncome }
}

export const usePairDetails = (token0?: Token, token1?: Token, activeCurrencyOption?: Token) => {
  const [pairAddress, setPairAddress] = useState('')

  useEffect(() => {
    if (token0 && token1) {
      try {
        setPairAddress(Pair.getAddress(token0, token1))
      } catch {}
    }
  }, [token0, token1])
  const { loading: isLoadingVolume24hUSD, volume24hUSD } = usePair24hVolumeUSD(pairAddress)
  const [token0Price, token1Price] = [useCoingeckoUSDPrice(token0), useCoingeckoUSDPrice(token1)]

  const [isPairModalOpen, setIsPairModalOpen] = useState(false)

  const [activeCurrencyDetails, setActiveCurrencyDetails] = useState<ActiveCurrencyDetails>({
    price: '',
    volume24h: '',
    relativePrice: '',
    priceChange24h: '',
    percentPriceChange24h: '',
    isIncome24h: false,
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
      !token0Price.loading &&
      !token1Price.loading &&
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
        const relativePrice = Number(token1Price.price.toSignificant(6)) / Number(token0Price.price.toSignificant(6))
        const { priceChange24hWithSymbol, percentPriceChange24h, isIncome } = calculatePrices(
          relativePrice,
          token0Price24h,
          token1Price24h,
          activeCurrencyOption?.symbol ?? ''
        )
        setActiveCurrencyDetails({
          price: `$${token1Price.price.toFixed(4)}`,
          priceChange24h: priceChange24hWithSymbol,
          percentPriceChange24h: percentPriceChange24h,
          isIncome24h: isIncome,
          volume24h: calculate24hVolumeForActiveCurrencyOption(volume24hUSD, token0Price.price, activeCurrencyOption),
          relativePrice: Number(relativePrice.toFixed(4)) !== 0 ? relativePrice.toFixed(4) : '< 0.0001',
        })
      } else {
        const relativePrice = Number(token0Price.price.toSignificant(6)) / Number(token1Price.price.toSignificant(6))
        const { priceChange24hWithSymbol, percentPriceChange24h, isIncome } = calculatePrices(
          relativePrice,
          token1Price24h,
          token0Price24h,
          activeCurrencyOption?.symbol ?? ''
        )
        setActiveCurrencyDetails({
          price: `$${token0Price.price.toFixed(4)}`,
          priceChange24h: priceChange24hWithSymbol,
          percentPriceChange24h: percentPriceChange24h,
          isIncome24h: isIncome,
          volume24h: calculate24hVolumeForActiveCurrencyOption(volume24hUSD, token1Price.price, activeCurrencyOption),
          relativePrice: Number(relativePrice.toFixed(4)) !== 0 ? relativePrice.toFixed(4) : '< 0.0001',
        })
      }
    } else {
      setActiveCurrencyDetails({
        price: '-',
        volume24h: '-',
        relativePrice: '-',
        isIncome24h: false,
        priceChange24h: '-',
        percentPriceChange24h: '-',
      })
    }
  }, [
    activeCurrencyOption,
    isLoadingVolume24hUSD,
    token0,
    volume24hUSD,
    token0Price.loading,
    token0Price.price,
    token0Price.priceChange24h,
    token0Price.isIncome24h,
    token1Price.loading,
    token1Price.price,
    token1Price.priceChange24h,
    token1Price.isIncome24h,
  ])

  return {
    onDismiss,
    onPairSelect,
    handleOpenModal,
    isPairModalOpen,
    isLoading: isLoadingVolume24hUSD || token0Price.loading || token1Price.loading,
    volume24hUSD: volume24hUSD === ZERO_USD ? '-' : `${volume24hUSD.toFixed(2)}$`,
    activeCurrencyDetails,
  }
}
