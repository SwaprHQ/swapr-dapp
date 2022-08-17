import { AddressZero } from '@ethersproject/constants'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'
import { Currency, CurrencyAmount, JSBI, Percent, RoutablePlatform, Token, TokenAmount, Trade } from '@swapr/sdk'

import { createSelector } from '@reduxjs/toolkit'
import { useWhatChanged } from '@simbathesailor/use-what-changed'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'

import { SWAP_INPUT_ERRORS } from '../../constants/index'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import useENS from '../../hooks/useENS'
import { useNativeCurrency } from '../../hooks/useNativeCurrency'
import { useParsedQueryString } from '../../hooks/useParsedQueryString'
import {
  EcoRouterResults,
  getExactIn as getExactInFromEcoRouter,
  getExactOut as getExactOutFromEcoRouter,
} from '../../lib/eco-router'
import { isAddress } from '../../utils'
import { currencyId } from '../../utils/currencyId'
import { computeSlippageAdjustedAmounts } from '../../utils/prices'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { AppDispatch, AppState } from '../index'
import { useIsMultihop, useUserSlippageTolerance } from '../user/hooks'
import { useCurrencyBalances } from '../wallet/hooks'
import { selectPair, selectToken, setRecipient, typeInput, updateZapState } from './actions'
import { Asset } from './types'

const selectZap = createSelector(
  (state: AppState) => state.zap,
  zap => zap
)

export function useZapState() {
  return useSelector<AppState, AppState['zap']>(selectZap)
}

export function useZapActionHandlers(): {
  onTokenSelection: (tokenId: string) => void
  onPairSelection: (token0Id: string, token1Id: string) => void
  onUserInput: (inputAsset: Asset, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onTokenSelection = useCallback(
    (tokenId: string) => {
      dispatch(
        selectToken({
          tokenId: tokenId,
        })
      )
    },
    [dispatch]
  )

  const onPairSelection = useCallback(
    (token0Id: string, token1Id: string) => {
      dispatch(
        selectPair({
          token0Id: token0Id,
          token1Id: token1Id,
        })
      )
    },
    [dispatch]
  )

  const onUserInput = useCallback(
    (inputAsset: Asset, typedValue: string) => {
      dispatch(typeInput({ inputAsset, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  return {
    onTokenSelection,
    onPairSelection,
    onUserInput,
    onChangeRecipient,
  }
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency, chainId?: number): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      if (currency instanceof Token) return new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
      else if (chainId) return CurrencyAmount.nativeCurrency(JSBI.BigInt(typedValueParsed), chainId)
      else return undefined
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}
