import { Trade, UniswapV2RoutablePlatform } from '@swapr/sdk'

import React, { useState } from 'react'
import { Trans } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'
import { Box } from 'rebass'

import { setRecipient } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import { AdvancedSwapDetailsToggle } from '../AdvancedSwapDetailsToggle'
import { AutoColumn } from '../Column'
import { RecipientField } from '../RecipientField'
import { RowBetween, RowFixed } from '../Row'
import { SwapSettings } from './SwapSettings'
import TradePrice from './TradePrice'

interface TradeDetailsProps {
  show: boolean
  trade: Trade | undefined
  bestPricedTrade: Trade | undefined
  showAdvancedSwapDetails: boolean
  setShowAdvancedSwapDetails: (show: boolean) => void
  recipient: string | null
  loading: boolean
}
export function TradeDetails({
  show,
  trade,
  bestPricedTrade,
  showAdvancedSwapDetails,
  setShowAdvancedSwapDetails,
  recipient,
  loading,
}: TradeDetailsProps) {
  const [showAddRecipient, setShowAddRecipient] = useState<boolean>(false)
  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  if (loading) {
    return (
      <AutoColumn gap="8px">
        <RowBetween alignItems="center">
          <Skeleton width="150px" height="13px" />
          <Skeleton width="18px" height="18px" />
        </RowBetween>
        <RowBetween>
          <Box alignItems="center" width={'140px'} display="flex" justifyContent={'space-between'}>
            <Skeleton width="48px" height="20px" />
            <Skeleton width="22px" height="20px" />
            <Skeleton width="27px" height="20px" />
            <Skeleton width="22px" height="20px" />
          </Box>
          <RowFixed alignItems={'end!important'}>
            <Skeleton width="100px" height="13px" />
          </RowFixed>
        </RowBetween>
      </AutoColumn>
    )
  }

  if (show && trade !== undefined) {
    return (
      <>
        <AutoColumn gap="8px">
          <RowBetween alignItems="center">
            <TYPE.body fontSize="11px" lineHeight="15px" fontWeight="500">
              <Trans
                i18nKey="bestPriceFoundOn"
                values={{ platform: bestPricedTrade?.platform.name }}
                components={[<span key="1" style={{ color: 'white', fontWeight: 700 }}></span>]}
              />
              {trade.platform.name !== UniswapV2RoutablePlatform.SWAPR.name ? (
                <>
                  {' '}
                  <Trans
                    i18nKey="swapWithNoAdditionalFees"
                    components={[<span key="1" style={{ color: 'white', fontWeight: 700 }}></span>]}
                  />
                </>
              ) : null}
            </TYPE.body>
            <AdvancedSwapDetailsToggle
              setShowAdvancedSwapDetails={setShowAdvancedSwapDetails}
              showAdvancedSwapDetails={showAdvancedSwapDetails}
            />
          </RowBetween>
          <RowBetween>
            <SwapSettings showAddRecipient={showAddRecipient} setShowAddRecipient={setShowAddRecipient} />
            <RowFixed>
              <TradePrice price={trade?.executionPrice} showInverted={showInverted} setShowInverted={setShowInverted} />
            </RowFixed>
          </RowBetween>
        </AutoColumn>
        {showAddRecipient && <RecipientField recipient={recipient} action={setRecipient} />}
      </>
    )
  }

  return null
}
