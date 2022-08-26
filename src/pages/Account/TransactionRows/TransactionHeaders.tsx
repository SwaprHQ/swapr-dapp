import { Flex } from 'rebass'

import { Header } from '../../../ui/Header'
import { HeaderText } from '../../../ui/HeaderText'
import { HeaderRow, TranasctionDetails } from '../Account.styles'

export function TransactionHeaders() {
  return (
    <HeaderRow>
      <HeaderText>
        <Header justifyContent="space-between" paddingX="22px" paddingY="12px">
          <Flex flex="55%">
            <TranasctionDetails flex="15%" justifyContent="start">
              From
            </TranasctionDetails>
            <TranasctionDetails flex="15%" justifyContent="start">
              To
            </TranasctionDetails>
            <TranasctionDetails justifyContent="start">Price</TranasctionDetails>
          </Flex>
          <Flex flex="45%">
            <TranasctionDetails>Type</TranasctionDetails>
            <TranasctionDetails>Status</TranasctionDetails>
            <TranasctionDetails>Time</TranasctionDetails>
          </Flex>
        </Header>
      </HeaderText>
    </HeaderRow>
  )
}
