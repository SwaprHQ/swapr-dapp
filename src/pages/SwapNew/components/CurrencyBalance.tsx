import { Currency, _10000 } from '@swapr/sdk'

import styled from 'styled-components'

import { useActiveWeb3React } from '../../../hooks'
import { useCurrencyBalance } from '../../../state/wallet/hooks'
import { limitNumberOfDecimalPlaces } from '../../../utils/prices'
import { TEXT_COLOR_SECONDARY } from '../constants'
import { FontFamily } from './styles'

type CurrencyBalanceProps = {
  currency?: Currency
}

export function CurrencyBalance({ currency }: CurrencyBalanceProps) {
  const { account } = useActiveWeb3React()

  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  if (!account) return null

  const trimmedBalance: string = selectedCurrencyBalance?.greaterThan(_10000)
    ? selectedCurrencyBalance.toFixed(2)
    : limitNumberOfDecimalPlaces(selectedCurrencyBalance) || '0'

  return (
    <Paragraph>
      Balance: <span>{trimmedBalance}</span>
    </Paragraph>
  )
}

const Paragraph = styled.p`
  width: fit-content;
  line-height: 12px;
  font-size: 10px;
  ${FontFamily}
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${TEXT_COLOR_SECONDARY};

  & span {
    text-decoration: underline;
  }
`
