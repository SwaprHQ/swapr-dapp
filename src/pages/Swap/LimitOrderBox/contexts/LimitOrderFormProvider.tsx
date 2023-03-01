import { ChainId, Token, USDC } from '@swapr/sdk'
import { wrappedCurrency } from '@swapr/sdk/dist/entities/trades/utils'

import { formatUnits } from 'ethers/lib/utils'
import { ReactNode, useContext, useLayoutEffect, useRef, useState } from 'react'

import { PRE_SELECT_OUTPUT_CURRENCY_ID } from '../../../../constants'
import { useActiveWeb3React } from '../../../../hooks/index'
import { useCurrency } from '../../../../hooks/Tokens'
import { useHigherUSDValue } from '../../../../hooks/useUSDValue'
import { useDefaultsFromURLSearch } from '../../../../state/swap/hooks'
import { Field } from '../../../../state/swap/types'
import { SwapContext } from '../../SwapBox/SwapContext'
import { supportedChainIdList } from '../constants/index'
import { InputFocus, OrderExpiresInUnit } from '../interfaces'
import { getInitialState } from '../utils'
import { LimitOrderFormContext } from './LimitOrderFormContext'

export function LimitOrderFormBaseConditionalProvider({
  account,
  chainId,
  children,
}: {
  chainId: ChainId
  account: string
  children: ReactNode
}) {
  useDefaultsFromURLSearch()
  const { currencies } = useContext(SwapContext)

  const preSelectBuyToken = useCurrency(PRE_SELECT_OUTPUT_CURRENCY_ID[chainId])
  const sellToken =
    (currencies[Field.INPUT] && wrappedCurrency(currencies[Field.INPUT], chainId)) || Token.getNativeWrapper(chainId)
  const buyToken =
    (currencies[Field.OUTPUT] && wrappedCurrency(currencies[Field.OUTPUT], chainId)) ||
    preSelectBuyToken ||
    USDC[chainId]

  // Get the initial values and set the state
  let initialState = useRef(getInitialState(account, sellToken, buyToken as Token))

  // Default expiry time set to 3 days
  const [expiresInUnit, setExpiresInUnit] = useState(OrderExpiresInUnit.Days)
  const [expiresIn, setExpiresIn] = useState(3)

  // State holding the sell and buy currency amounts
  const [sellTokenAmount, setSellTokenAmount] = useState(initialState.current.sellTokenAmount)
  const [buyTokenAmount, setBuyTokenAmount] = useState(initialState.current.buyTokenAmount)

  // Final limit order to be sent to the internal API
  const [limitOrder, setLimitOrder] = useState(initialState.current.limitOrder)

  const [inputFocus, setInputFocus] = useState(InputFocus.SELL)

  // Display formatted sell/buy amounts
  const [formattedSellAmount, setFormattedSellAmount] = useState(
    parseFloat(
      formatUnits(initialState.current.limitOrder.sellAmount, initialState.current.sellTokenAmount.currency.decimals)
    ).toFixed(6)
  )
  const [formattedBuyAmount, setFormattedBuyAmount] = useState('0')
  // Display formatted sell/buy amounts
  const [formattedLimitPrice, setFormattedLimitPrice] = useState('0')

  const { fiatValueInput, fiatValueOutput, isFallbackFiatValueInput, isFallbackFiatValueOutput } = useHigherUSDValue({
    inputCurrencyAmount: sellTokenAmount,
    outputCurrencyAmount: buyTokenAmount,
  })

  useLayoutEffect(() => {
    initialState.current = getInitialState(account, sellToken, buyToken as Token, sellTokenAmount)
    setSellTokenAmount(initialState.current.sellTokenAmount)
    setBuyTokenAmount(initialState.current.buyTokenAmount)
    setLimitOrder(initialState.current.limitOrder)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellToken, buyToken])

  useLayoutEffect(() => {
    initialState.current = getInitialState(account, sellToken, buyToken as Token)
    setSellTokenAmount(initialState.current.sellTokenAmount)
    setBuyTokenAmount(initialState.current.buyTokenAmount)
    setLimitOrder(initialState.current.limitOrder)
    setFormattedSellAmount(
      parseFloat(
        formatUnits(initialState.current.limitOrder.sellAmount, initialState.current.sellTokenAmount.currency.decimals)
      ).toFixed(6)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId])

  return (
    <LimitOrderFormContext.Provider
      value={{
        limitOrder,
        setLimitOrder,
        buyTokenAmount,
        setBuyTokenAmount,
        sellTokenAmount,
        setSellTokenAmount,
        formattedLimitPrice,
        setFormattedLimitPrice,
        formattedBuyAmount,
        setFormattedBuyAmount,
        formattedSellAmount,
        setFormattedSellAmount,
        expiresIn,
        setExpiresIn,
        expiresInUnit,
        setExpiresInUnit,
        inputFocus,
        setInputFocus,
        fiatValueInput,
        fiatValueOutput,
        isFallbackFiatValueInput,
        isFallbackFiatValueOutput,
      }}
    >
      {children}
    </LimitOrderFormContext.Provider>
  )
}

export const LimitOrderFromProvider = ({ children }: { children: ReactNode }) => {
  const { chainId, account } = useActiveWeb3React()
  const noLimitOrderSupport = chainId ? !supportedChainIdList.includes(chainId) : true

  if (!chainId || noLimitOrderSupport || !account) return <>{children}</>

  return (
    <LimitOrderFormBaseConditionalProvider chainId={chainId} account={account}>
      {children}
    </LimitOrderFormBaseConditionalProvider>
  )
}
