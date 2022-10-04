import { CurrencyAmount, Pair, Price, Token } from '@swapr/sdk'

import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { ZERO_USD } from '../../constants'
import { usePair24hVolumeUSD } from '../../hooks/usePairVolume24hUSD'
import { useCoingeckoUSDPrice } from '../../hooks/useUSDValue'
import { selectCurrency } from '../../state/swap/actions'
import { Field } from '../../state/swap/types'

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

    return `${(Number(volume24hUSD.toSignificant()) / Number(price.toSignificant())).toFixed(2)} ${
      activeCurrencyOption?.symbol ?? ''
    }`
  } catch {
    return '-'
  }
}

const calculateUSDChange24h = (price: Price, percentagePriceChange24h: number, isIncome24h: boolean) => {
  const priceUSDChange24h = (Number(percentagePriceChange24h.toFixed(6)) * Number(price.toFixed(6))) / 100
  return isIncome24h ? Number(price.toFixed(6)) - priceUSDChange24h : Number(price.toFixed(6)) + priceUSDChange24h
}

const calculatePrices = (relativePrice: number, token0Price24h: number, token1Price24h: number, symbol: string) => {
  const relativePrice24h = token1Price24h / token0Price24h
  const priceChange24h = Math.abs(Number(relativePrice.toFixed(6)) - Number(relativePrice24h.toFixed(6))).toFixed(4)
  const priceChange24hWithSymbol = `${Number(priceChange24h) !== 0 ? `${priceChange24h}` : '< 0.0001'}  ${symbol}`
  const percentPriceChange24h = (
    ((Number(relativePrice.toFixed(6)) - Number(relativePrice24h.toFixed(6))) / Number(relativePrice.toFixed(6))) *
    100
  ).toFixed(2)
  const isIncome = relativePrice24h < relativePrice
  return { priceChange24hWithSymbol, percentPriceChange24h, isIncome }
}

export const usePairDetails = (token0?: Token, token1?: Token, activeCurrencyOption?: Token) => {
  const [pairAddress, setPairAddress] = useState('')
  const dispatch = useDispatch()

  useEffect(() => {
    if (token0 && token1) {
      try {
        setPairAddress(Pair.getAddress(token0, token1))
      } catch {}
    }
  }, [token0, token1])

  const { loading: isLoadingVolume24hUSD, volume24hUSD } = usePair24hVolumeUSD(pairAddress)
  const [token0USDPrice, token1USDPrice] = [useCoingeckoUSDPrice(token0), useCoingeckoUSDPrice(token1)]

  const [isPairModalOpen, setIsPairModalOpen] = useState(false)

  const [activeCurrencyDetails, setActiveCurrencyDetails] = useState<ActiveCurrencyDetails>({
    price: '',
    volume24h: '',
    relativePrice: '',
    priceChange24h: '',
    percentPriceChange24h: '',
    isIncome24h: true,
  })

  const handleOpenModal = () => {
    setIsPairModalOpen(true)
  }

  const onDismiss = () => {
    setIsPairModalOpen(false)
  }

  const onPairSelect = useCallback(
    (pair: Pair) => {
      dispatch(
        selectCurrency({
          field: Field.INPUT,
          currencyId: pair.token0.address,
        })
      )
      dispatch(
        selectCurrency({
          field: Field.OUTPUT,
          currencyId: pair.token1.address,
        })
      )
    },
    [dispatch]
  )

  useEffect(() => {
    if (
      !isLoadingVolume24hUSD &&
      !token0USDPrice.loading &&
      !token1USDPrice.loading &&
      volume24hUSD &&
      token0USDPrice.price &&
      token0USDPrice.percentagePriceChange24h &&
      token0USDPrice.isIncome24h !== undefined &&
      token1USDPrice.price &&
      token1USDPrice.percentagePriceChange24h &&
      token1USDPrice.isIncome24h !== undefined &&
      activeCurrencyOption &&
      token0
    ) {
      const token1USDPrice24h = calculateUSDChange24h(
        token1USDPrice.price,
        token1USDPrice.percentagePriceChange24h,
        token1USDPrice.isIncome24h
      )
      const token0USDPrice24h = calculateUSDChange24h(
        token0USDPrice.price,
        token0USDPrice.percentagePriceChange24h,
        token0USDPrice.isIncome24h
      )

      const relativePrice0 = Number(token0USDPrice.price.toSignificant()) / Number(token1USDPrice.price.toSignificant())
      const relativePrice1 = Number(token1USDPrice.price.toSignificant()) / Number(token0USDPrice.price.toSignificant())

      if (token0.address.toLowerCase() === activeCurrencyOption.address.toLowerCase()) {
        const { priceChange24hWithSymbol, percentPriceChange24h, isIncome } = calculatePrices(
          relativePrice1,
          token0USDPrice24h,
          token1USDPrice24h,
          activeCurrencyOption?.symbol ?? ''
        )

        setActiveCurrencyDetails({
          price: `$${token0USDPrice.price.toFixed(2)}`,
          priceChange24h: priceChange24hWithSymbol,
          percentPriceChange24h: percentPriceChange24h,
          isIncome24h: isIncome,
          volume24h: calculate24hVolumeForActiveCurrencyOption(
            volume24hUSD,
            token0USDPrice.price,
            activeCurrencyOption
          ),
          relativePrice: Number(relativePrice0.toFixed(4)) !== 0 ? relativePrice0.toFixed(4) : '< 0.0001',
        })
      } else {
        const { priceChange24hWithSymbol, percentPriceChange24h, isIncome } = calculatePrices(
          relativePrice0,
          token1USDPrice24h,
          token0USDPrice24h,
          activeCurrencyOption?.symbol ?? ''
        )

        setActiveCurrencyDetails({
          price: `$${token1USDPrice.price.toFixed(4)}`,
          priceChange24h: priceChange24hWithSymbol,
          percentPriceChange24h: percentPriceChange24h,
          isIncome24h: isIncome,
          volume24h: calculate24hVolumeForActiveCurrencyOption(
            volume24hUSD,
            token1USDPrice.price,
            activeCurrencyOption
          ),
          relativePrice: Number(relativePrice1.toFixed(4)) !== 0 ? relativePrice1.toFixed(4) : '< 0.0001',
        })
      }
    } else {
      setActiveCurrencyDetails({
        price: '-',
        volume24h: '-',
        relativePrice: '-',
        isIncome24h: true,
        priceChange24h: '-',
        percentPriceChange24h: '-',
      })
    }
  }, [
    activeCurrencyOption,
    isLoadingVolume24hUSD,
    token0,
    volume24hUSD,
    token0USDPrice.loading,
    token0USDPrice.price,
    token0USDPrice.percentagePriceChange24h,
    token0USDPrice.isIncome24h,
    token1USDPrice.loading,
    token1USDPrice.price,
    token1USDPrice.percentagePriceChange24h,
    token1USDPrice.isIncome24h,
  ])

  return {
    onDismiss,
    onPairSelect,
    handleOpenModal,
    isPairModalOpen,
    isLoading: isLoadingVolume24hUSD || token0USDPrice.loading || token1USDPrice.loading,
    volume24hUSD: volume24hUSD === ZERO_USD ? '-' : `${volume24hUSD.toFixed(2)}$`,
    activeCurrencyDetails,
  }
}
