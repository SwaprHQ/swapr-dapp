import { ChainId, CurrencyAmount, Pair, Price, Token } from '@swapr/sdk'

import { useEffect, useState } from 'react'

import { useActiveWeb3React } from '../../hooks'
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
  console.log(
    price,
    priceChange24h,
    price.toFixed(6),
    priceChange24h.toFixed(6),
    price.subtract(priceChange24h).toFixed(6),
    price.add(priceChange24h).toFixed(6)
  )
  return isIncome24h
    ? Number(price.toFixed(6)) - Number(priceChange24h.toFixed(6))
    : Number(price.toFixed(6)) + Number(priceChange24h.toFixed(6))
}

export const usePairDetails = (token0?: Token, token1?: Token, activeCurrencyOption?: Token) => {
  const [pairAddress, setPairAddress] = useState('')
  const { chainId } = useActiveWeb3React()

  useEffect(() => {
    if (token0 && token1 && chainId !== ChainId.OPTIMISM_MAINNET && chainId !== ChainId.POLYGON) {
      setPairAddress(Pair.getAddress(token0, token1))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const relativePrice = Number(token1Price.price.toFixed(6)) / Number(token0Price.price.toFixed(6))
        const relativePrice24h = token1Price24h / token0Price24h
        console.log(token1Price24h.toFixed(2), token0Price24h.toFixed(2))
        setActiveCurrencyDetails({
          price: token1Price.price.toFixed(6),
          priceChange24h: Math.abs(Number(relativePrice24h.toFixed(6)) - Number(relativePrice.toFixed(6))).toFixed(2),
          percentPriceChange24h: Math.abs(
            ((Number(relativePrice24h.toFixed(6)) - Number(relativePrice.toFixed(6))) /
              Number(relativePrice24h.toFixed(6))) *
              100
          ).toFixed(2),
          isIncome24h: relativePrice24h < relativePrice,
          volume24h: calculate24hVolumeForActiveCurrencyOption(volume24hUSD, token0Price.price),
          relativePrice: Number(relativePrice.toFixed(6)),
        })
      } else {
        const relativePrice = Number(token0Price.price.toFixed(6)) / Number(token1Price.price.toFixed(6))
        const relativePrice24h = token0Price24h / token1Price24h
        console.log(token1Price24h.toFixed(2), token0Price24h.toFixed(2))
        setActiveCurrencyDetails({
          price: token0Price.price.toFixed(6),
          priceChange24h: Math.abs(Number(relativePrice24h.toFixed(6)) - Number(relativePrice.toFixed(6))).toFixed(2),
          percentPriceChange24h: Math.abs(
            ((Number(relativePrice24h.toFixed(6)) - Number(relativePrice.toFixed(6))) /
              Number(relativePrice24h.toFixed(6))) *
              100
          ).toFixed(2),
          isIncome24h: relativePrice24h < relativePrice,
          volume24h: calculate24hVolumeForActiveCurrencyOption(volume24hUSD, token1Price.price),
          relativePrice: Number(relativePrice.toFixed(6)),
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
