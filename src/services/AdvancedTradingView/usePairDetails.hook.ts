import { CurrencyAmount, Pair, Price, Token } from '@swapr/sdk'

import { useEffect, useState } from 'react'

import { ZERO_USD } from '../../constants'
import { usePair24hVolumeUSD } from '../../hooks/usePairVolume24hUSD'
import { useCoingeckoUSDPrice } from '../../hooks/useUSDValue'

type ActiveCurrencyDetails = {
  price: string
  volume24h: string
  relativePrice: string
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
          price: `$${token1Price.price.toFixed(4)}`,
          volume24h: calculate24hVolumeForActiveCurrencyOption(volume24hUSD, token0Price.price, activeCurrencyOption),
          relativePrice: (
            Number(token1Price.price.toSignificant()) / Number(token0Price.price.toSignificant())
          ).toFixed(4),
        })
      } else {
        setActiveCurrencyDetails({
          price: `$${token0Price.price.toFixed(4)}`,
          volume24h: calculate24hVolumeForActiveCurrencyOption(volume24hUSD, token1Price.price, activeCurrencyOption),
          relativePrice: (
            Number(token0Price.price.toSignificant()) / Number(token1Price.price.toSignificant())
          ).toFixed(4),
        })
      }
    } else {
      setActiveCurrencyDetails({
        price: '-',
        volume24h: '-',
        relativePrice: '-',
      })
    }
  }, [activeCurrencyOption, isLoadingVolume24hUSD, token0, token0Price.price, token1Price.price, volume24hUSD])

  return {
    onDismiss,
    onPairSelect,
    handleOpenModal,
    isPairModalOpen,
    isLoading: isLoadingVolume24hUSD,
    volume24hUSD: volume24hUSD === ZERO_USD ? '-' : `${volume24hUSD.toFixed(2)}$`,
    activeCurrencyDetails,
  }
}
