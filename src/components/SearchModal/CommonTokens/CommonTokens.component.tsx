import { currencyEquals, Token } from '@swapr/sdk'

import { useCallback, useState } from 'react'
import { Text } from 'rebass'

import { SUGGESTED_BASES } from '../../../constants'
import { useNativeCurrency } from '../../../hooks/useNativeCurrency'
import { TYPE } from '../../../theme'
import { AutoColumn } from '../../Column'
import { CurrencyLogo } from '../../CurrencyLogo'
import Row from '../../Row'
import { BaseWrapper } from '../shared'
import { CommonTokensProps } from './CommonTokens.types'

export const CommonTokens = ({ chainId, onCurrencySelect, selectedCurrency }: CommonTokensProps) => {
  const nativeCurrency = useNativeCurrency()
  const [activeTab, setActiveTab] = useState(0)

  const handleClick = useCallback(() => {
    if (!selectedCurrency || !currencyEquals(selectedCurrency, nativeCurrency)) {
      onCurrencySelect(nativeCurrency)
    }
  }, [nativeCurrency, onCurrencySelect, selectedCurrency])

  return (
    <AutoColumn gap="15px" data-testid="common-tokens">
      <Row justifyContent="center" gap={'24px'}>
        {['COMMON TOKENS', 'FAVORITES', 'CARROTS'].map((item, index) => (
          <TYPE.Body
            key={index}
            fontWeight={700}
            fontSize="11px"
            lineHeight="13px"
            letterSpacing="0.06em"
            style={{ color: activeTab === index ? '#C0BAF6' : '#8780BF' }}
            onClick={() => {
              setActiveTab(index)
            }}
          >
            {item}
          </TYPE.Body>
        ))}
      </Row>
      <Row gap="8px" justifyContent="center" flexWrap={'wrap'}>
        <BaseWrapper
          onClick={handleClick}
          disabled={selectedCurrency === nativeCurrency || selectedCurrency === undefined}
        >
          <CurrencyLogo size="20px" currency={nativeCurrency} marginRight={8} />
          <Text fontWeight={500} fontSize={16}>
            {nativeCurrency.symbol}
          </Text>
        </BaseWrapper>
        {chainId &&
          SUGGESTED_BASES[chainId]?.map((token: Token) => {
            const selected = selectedCurrency instanceof Token && selectedCurrency.address === token.address
            return (
              <BaseWrapper onClick={() => !selected && onCurrencySelect(token)} disabled={selected} key={token.address}>
                <CurrencyLogo size="20px" currency={token} marginRight={8} />
                <Text fontWeight={500} fontSize={16}>
                  {token.symbol}
                </Text>
              </BaseWrapper>
            )
          })}
      </Row>
    </AutoColumn>
  )
}
