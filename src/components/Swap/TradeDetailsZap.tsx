import { Trade } from '@swapr/sdk'

import { useState } from 'react'
import { Trans } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'
import { Box } from 'rebass'

import { setRecipient } from '../../state/zap/actions'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { RecipientField } from '../RecipientField'
import { RowBetween, RowFixed } from '../Row'
import { SwapSettings } from './SwapSettings'
import TradePrice from './TradePrice'

interface TradeDetailsProps {
  show: boolean
  tradeToken0: Trade | undefined
  tradeToken1: Trade | undefined
  recipient: string | null
  loading: boolean
}
export function ZapTradesDetails({ show, tradeToken0, tradeToken1, recipient, loading }: TradeDetailsProps) {
  const [showAddRecipient, setShowAddRecipient] = useState<boolean>(false)
  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  if (loading) {
    return (
      <>
        <AutoColumn gap="8px">
          <RowBetween alignItems="center">
            <Skeleton width="150px" height="13px" />
          </RowBetween>
          <RowBetween>
            <RowFixed alignItems={'end!important'}>
              <Skeleton width="100px" height="13px" />
            </RowFixed>
          </RowBetween>
        </AutoColumn>
        <AutoColumn gap="8px">
          <RowBetween alignItems="center">
            <Skeleton width="150px" height="13px" />
          </RowBetween>
          <RowBetween>
            <RowFixed alignItems={'end!important'}>
              <Skeleton width="100px" height="13px" />
            </RowFixed>
            <Box alignItems="center" width={'140px'} display="flex" justifyContent={'space-between'}>
              <Skeleton width="48px" height="20px" />
              <Skeleton width="22px" height="20px" />
              <Skeleton width="27px" height="20px" />
              <Skeleton width="22px" height="20px" />
            </Box>
          </RowBetween>
        </AutoColumn>
      </>
    )
  }

  if (show && tradeToken0 !== undefined && tradeToken1 !== undefined) {
    return (
      <>
        <AutoColumn gap="8px">
          <RowBetween alignItems="center">
            <TYPE.Body fontSize="11px" lineHeight="15px" fontWeight="500">
              <Trans
                i18nKey="swap:tradeDetails.bestPriceFoundOn"
                values={{ platform: tradeToken0?.platform.name }}
                components={[<span key="1" style={{ color: 'white', fontWeight: 700 }}></span>]}
              />{' '}
              <Trans
                i18nKey="swap:tradeDetails.priceImpact"
                values={{ priceImpact: tradeToken0?.priceImpact.toSignificant(3) }}
                components={[<span key="1" style={{ color: 'white', fontWeight: 700 }}></span>]}
              />
            </TYPE.Body>
          </RowBetween>
          <RowBetween>
            <RowFixed>
              <TradePrice
                price={tradeToken0?.executionPrice}
                showInverted={showInverted}
                setShowInverted={setShowInverted}
              />
            </RowFixed>
          </RowBetween>
          <RowBetween alignItems="center">
            <TYPE.Body fontSize="11px" lineHeight="15px" fontWeight="500">
              <Trans
                i18nKey="swap:tradeDetails.bestPriceFoundOn"
                values={{ platform: tradeToken1?.platform.name }}
                components={[<span key="1" style={{ color: 'white', fontWeight: 700 }}></span>]}
              />{' '}
              <Trans
                i18nKey="swap:tradeDetails.priceImpact"
                values={{ priceImpact: tradeToken1?.priceImpact.toSignificant(3) }}
                components={[<span key="1" style={{ color: 'white', fontWeight: 700 }}></span>]}
              />
            </TYPE.Body>
          </RowBetween>

          <RowBetween>
            <RowFixed>
              <TradePrice
                price={tradeToken1?.executionPrice}
                showInverted={showInverted}
                setShowInverted={setShowInverted}
              />
            </RowFixed>
            <SwapSettings
              showAddRecipient={showAddRecipient}
              setShowAddRecipient={setShowAddRecipient}
              isMEVProtectionEnabled={false}
            />
          </RowBetween>
        </AutoColumn>
        {showAddRecipient && <RecipientField setRecipient={setRecipient} recipient={recipient} />}
      </>
    )
  }

  return null
}
