import { TableHeader } from '../../../ui/StyledElements/TableHeader'
import { TableHeaderText } from '../../../ui/StyledElements/TableHeaderText'
import { HeaderRow, TransactionDetails } from '../Account.styles'

export function TransactionHeaders() {
  return (
    <HeaderRow>
      <TableHeaderText>
        <TableHeader justifyContent="space-between" paddingX="22px" paddingY="12px">
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
        </TableHeader>
      </TableHeaderText>
    </HeaderRow>
  )
}
