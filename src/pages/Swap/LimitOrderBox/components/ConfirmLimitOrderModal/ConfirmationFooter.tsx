import styled, { useTheme } from 'styled-components'

import { ButtonPrimary } from '../../../../../components/Button'
import { StyledKey, StyledValue } from '../../../Components/SwapModalFooter'

export type FooterData = {
  askPrice: string
  marketPriceDifference: string
  isDiffPositive: boolean
  expiresIn: string
  market: string
  onConfirm: () => void
}

export const ConfirmationFooter = ({
  askPrice,
  onConfirm,
  expiresIn,
  marketPriceDifference,
  isDiffPositive,
  market,
}: FooterData) => {
  const theme = useTheme()
  const priceDiffColor = isDiffPositive ? theme.green1 : theme.red1

  return (
    <Wrapper>
      <SingleRow>
        <StyledKey>Ask price</StyledKey>
        <StyledValue>{askPrice}</StyledValue>
      </SingleRow>
      <SingleRow>
        <StyledKey>Diff. market price</StyledKey>
        <StyledValue color={priceDiffColor}>{marketPriceDifference}%</StyledValue>
      </SingleRow>
      <SingleRow>
        <StyledKey>Expires in</StyledKey>
        <StyledValue> {expiresIn}</StyledValue>
      </SingleRow>
      <SingleRow>
        <StyledKey>Market</StyledKey>
        <StyledValue>{market}</StyledValue>
      </SingleRow>
      <ButtonPrimary marginTop={'20px'} onClick={onConfirm}>
        PLACE LIMIT ORDER
      </ButtonPrimary>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  gap: 7px;
  flex-direction: column;
`
const SingleRow = styled.div`
  display: flex;
  justify-content: space-between;
`
