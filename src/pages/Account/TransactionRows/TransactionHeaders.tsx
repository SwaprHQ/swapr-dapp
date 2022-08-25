import { Header } from '../../../ui/Header'
import { HeaderText } from '../../../ui/HeaderText'
import { HeaderRow, TranasctionDetails } from '../Account.styles'

export function TransactionHeaders() {
  return (
    <HeaderRow>
      <HeaderText>
        <Header justifyContent="space-between" paddingX="22px" paddingY="12px">
          <TranasctionDetails flex="15%" justifyContent="start">
            From
          </TranasctionDetails>
          <TranasctionDetails flex="15%" justifyContent="start">
            To
          </TranasctionDetails>
          <TranasctionDetails justifyContent="start">Price</TranasctionDetails>
          <TranasctionDetails>Type</TranasctionDetails>
          <TranasctionDetails>Status</TranasctionDetails>
          <TranasctionDetails>Time</TranasctionDetails>
        </Header>
      </HeaderText>
    </HeaderRow>
  )
}
