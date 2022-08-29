import { Header } from '../../../ui/Header'
import { HeaderText } from '../../../ui/HeaderText'
import { HeaderRow, TransactionDetails } from '../Account.styles'

export function TransactionHeaders() {
  return (
    <HeaderRow>
      <HeaderText>
        <Header justifyContent="space-between" paddingX="22px" paddingY="12px">
          <TransactionDetails flex="15%" justifyContent="start">
            From
          </TransactionDetails>
          <TransactionDetails flex="15%" justifyContent="start">
            To
          </TransactionDetails>
          <TransactionDetails justifyContent="start">Price</TransactionDetails>
          <TransactionDetails>Type</TransactionDetails>
          <TransactionDetails>Status</TransactionDetails>
          <TransactionDetails>Time</TransactionDetails>
        </Header>
      </HeaderText>
    </HeaderRow>
  )
}
