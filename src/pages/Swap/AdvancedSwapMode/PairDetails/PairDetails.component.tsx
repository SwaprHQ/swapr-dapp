import { Token } from '@swapr/sdk'

import { ChevronDown } from 'react-feather'
import { useTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'
import { Flex } from 'rebass'

import { DoubleCurrencyLogo } from '../../../../components/DoubleCurrencyLogo'
import { PairSearchModal } from '../../../../components/SearchModal/PairSearchModal'
import { usePairDetails } from '../../../../services/AdvancedTradingView/usePairDetails.hook'
import { PairInfo, PairSymbols, PairTab, PairValue, PairValueChange } from '../AdvancedSwapMode.styles'

interface PairDetailsProps {
  token0?: Token
  token1?: Token
  activeCurrencyOption: Token | null | undefined
}

export const PairDetails = ({ token0, token1, activeCurrencyOption }: PairDetailsProps) => {
  const { t } = useTranslation('swap')

  const { activeCurrencyDetails, handleOpenModal, isLoading, isPairModalOpen, onDismiss, onPairSelect, volume24hUSD } =
    usePairDetails(token0, token1, activeCurrencyOption)

  if (!token0 || !token1 || !activeCurrencyOption) return null

  return (
    <>
      <Flex alignItems="center">
        <Flex alignItems="center">
          <DoubleCurrencyLogo size={25} currency0={token0} currency1={token1} />
          <PairSymbols>
            {token0.symbol}/{token1.symbol}
          </PairSymbols>
          <ChevronDown style={{ cursor: 'pointer' }} onClick={handleOpenModal} />
        </Flex>
        <Flex flexBasis="80%" marginLeft="30px">
          <PairInfo>
            <PairValueChange size="16px" positive={Boolean(activeCurrencyDetails.isIncome24h)}>
              {isLoading ? <Skeleton width="100px" height="14px" /> : activeCurrencyDetails.relativePrice}
            </PairValueChange>
            <PairTab>{isLoading ? <Skeleton width="100px" height="14px" /> : activeCurrencyDetails.price}</PairTab>
          </PairInfo>
          <PairInfo>
            <PairTab>{t('advancedTradingView.Change24')}</PairTab>
            <PairValueChange positive={Boolean(activeCurrencyDetails.isIncome24h)}>
              {isLoading ? (
                <Skeleton width="182px" height="14px" />
              ) : (
                <>
                  {activeCurrencyDetails.priceChange24h} {activeCurrencyDetails.percentPriceChange24h}
                </>
              )}
            </PairValueChange>
          </PairInfo>
          <PairInfo>
            <PairTab>{t('advancedTradingView.Volume24')}</PairTab>
            <PairValue>
              {isLoading ? <Skeleton width="100px" height="14px" /> : activeCurrencyDetails.volume24h}
            </PairValue>
          </PairInfo>
          <PairInfo>
            <PairTab>{t('advancedTradingView.Volume24')}</PairTab>
            <PairValue>{isLoading ? <Skeleton width="100px" height="14px" /> : volume24hUSD}</PairValue>
          </PairInfo>
          <PairInfo>
            <PairTab>{t('advancedTradingView.High24')}</PairTab>
            <PairTab>&#45;</PairTab>
          </PairInfo>
          <PairInfo>
            <PairTab>{t('advancedTradingView.Low24')}</PairTab>
            <PairTab>&#45;</PairTab>
          </PairInfo>
        </Flex>
      </Flex>
      <PairSearchModal isOpen={isPairModalOpen} onDismiss={onDismiss} onPairSelect={onPairSelect} />
    </>
  )
}
