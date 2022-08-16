import Skeleton from 'react-loading-skeleton'
import { Flex } from 'rebass/styled-components'
import styled from 'styled-components'

import { DarkCard } from '../../../Card'
import DoubleCurrencyLogo from '../../../DoubleLogo'

export function LoadingCard() {
  return (
    <Card>
      <Flex alignItems="center" flexDirection="row" justifyContent="space-between">
        <Flex style={{ gap: '8px' }} flexDirection="column">
          <DoubleCurrencyLogo spaceBetween={0} marginLeft={0} marginRight={14} top={0} loading size={30} />
          <Skeleton height="18px" width="90px" />
          <Skeleton height="22px" width="100px" />
        </Flex>
        <Flex style={{ gap: '8px' }} alignItems="flex-end" flexDirection="column">
          <Skeleton height="10px" width="70px" />
          <Skeleton height="20px" width="35px" />
          <Skeleton height="20px" width="48px" />
        </Flex>
      </Flex>
    </Card>
  )
}

const Card = styled(DarkCard)`
  height: 147px;
  padding: 16px;
  min-width: 240px;
`
