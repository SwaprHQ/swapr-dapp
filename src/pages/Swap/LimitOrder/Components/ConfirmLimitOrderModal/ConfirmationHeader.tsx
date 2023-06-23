import { CurrencyAmount, TokenAmount } from '@swapr/sdk'

import { ArrowDown } from 'react-feather'
import styled from 'styled-components'

import { CurrencyLogo } from '../../../../../components/CurrencyLogo'
import { toFixedSix } from '../utils'

export type HeaderData = {
  fiatValueInput: CurrencyAmount | null
  fiatValueOutput: CurrencyAmount | null
  buyToken: TokenAmount
  sellToken: TokenAmount
}

export const ConfirmationHeader = ({ fiatValueInput, fiatValueOutput, buyToken, sellToken }: HeaderData) => {
  const fiatInput = fiatValueInput && fiatValueInput.toFixed(2, { groupSeparator: ',' })
  const fiatOutput = fiatValueOutput && fiatValueOutput.toFixed(2, { groupSeparator: ',' })

  return (
    <Wrapper>
      <CurrencyAmountContainer>
        <CurrencyLogoInfo>
          <PurpleText>YOU SWAP</PurpleText>
          <LogoWithText>
            <CurrencySymbol>{sellToken.currency.symbol}</CurrencySymbol>{' '}
            <CurrencyLogo size="20px" currency={sellToken.currency} />
          </LogoWithText>
        </CurrencyLogoInfo>
        <AmountWithUsd>
          <Amount>{toFixedSix(Number(sellToken.toExact()))}</Amount>
          {fiatInput && <PurpleText>${fiatInput}</PurpleText>}
        </AmountWithUsd>
      </CurrencyAmountContainer>
      <StyledArrow />
      <CurrencyAmountContainer>
        <CurrencyLogoInfo>
          <PurpleText>YOU RECIEVE</PurpleText>
          <LogoWithText>
            <CurrencySymbol>{buyToken.currency.symbol}</CurrencySymbol>{' '}
            <CurrencyLogo size="20px" currency={buyToken.currency} />
          </LogoWithText>
        </CurrencyLogoInfo>
        <AmountWithUsd>
          <Amount>{toFixedSix(Number(buyToken.toExact()))}</Amount>
          {fiatOutput && <PurpleText>${fiatOutput}</PurpleText>}
        </AmountWithUsd>
      </CurrencyAmountContainer>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`
const CurrencyAmountContainer = styled.div`
  display: flex;
  padding: 0 19px;
  align-items: center;
  justify-content: space-between;
  height: 82px;
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 8.72381px;
`
const CurrencySymbol = styled.div`
  font-weight: 600;
  font-size: 20px;
  line-height: 24px;
`
const LogoWithText = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`
const CurrencyLogoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const AmountWithUsd = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 4px;
`
const Amount = styled.div`
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
`
const PurpleText = styled.div`
  font-weight: 600;
  font-size: 10px;
  line-height: 12px;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.purple3};
`
const StyledArrow = styled(ArrowDown)`
  width: 100%;
  margin: 4px 0;
  height: 16px;
`
