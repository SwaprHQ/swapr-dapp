import { Token } from '@swapr/sdk'

import { ChevronDown, Repeat } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Flex } from 'rebass'

import DoubleCurrencyLogo from '../../../../components/DoubleLogo'
import {
  PairInfo,
  PairSymbols,
  PairTab,
  PairValue,
  PairValueChange,
  SwitchButton,
  SwitcherWrapper,
} from '../AdvancedSwapMode.styles'

interface PairDetailsProps {
  token0?: Token
  token1?: Token
  activeCurrencyOption?: Token
  handleSwitchCurrency: (option: Token) => void
}

export const PairDetails = ({ activeCurrencyOption, token0, token1, handleSwitchCurrency }: PairDetailsProps) => {
  const { t } = useTranslation('swap')

  if (!token0 || !token1 || !activeCurrencyOption) return null

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Flex alignItems="center">
        <DoubleCurrencyLogo size={25} currency0={token0} currency1={token1} />
        <PairSymbols>
          {token0.symbol}/{token1.symbol}
        </PairSymbols>
        <ChevronDown />
      </Flex>
      <Flex flexBasis="80%">
        <PairInfo>
          <PairValueChange size="16px" positive={true}>
            1610,2
          </PairValueChange>
          <PairTab>$1609</PairTab>
        </PairInfo>
        <PairInfo>
          <PairTab>
            <Flex alignItems="center" justifyContent="space-between">
              <span>{t('advancedTradingView.Change24')}</span>
              <Repeat size={12} />
            </Flex>
          </PairTab>
          <PairValueChange positive={false}>55 | -3.42%</PairValueChange>
        </PairInfo>
        <PairInfo>
          <PairTab>{t('advancedTradingView.High24')}</PairTab>
          <PairValue>1690</PairValue>
        </PairInfo>
        <PairInfo>
          <PairTab>{t('advancedTradingView.Low24')}</PairTab>
          <PairValue>1569</PairValue>
        </PairInfo>
        <PairInfo>
          <PairTab>{t('advancedTradingView.Volume24')}</PairTab>
          <PairValue>2569 USDT</PairValue>
        </PairInfo>
        <PairInfo>
          <PairTab>{t('advancedTradingView.Volume24')}</PairTab>
          <PairValue>2569$</PairValue>
        </PairInfo>
      </Flex>
      <SwitcherWrapper>
        <SwitchButton
          onClick={() => handleSwitchCurrency(token0)}
          active={activeCurrencyOption.address === token0.address}
        >
          {token0.symbol}
        </SwitchButton>
        <SwitchButton
          onClick={() => handleSwitchCurrency(token1)}
          active={activeCurrencyOption.address === token1.address}
        >
          {token1.symbol}
        </SwitchButton>
      </SwitcherWrapper>
    </Flex>
  )
}
