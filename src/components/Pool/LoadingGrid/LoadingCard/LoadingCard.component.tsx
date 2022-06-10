import React from 'react'
import Skeleton from 'react-loading-skeleton'
import { Flex } from 'rebass/styled-components'

import DoubleCurrencyLogo from '../../../DoubleLogo'
import { Card } from './LoadingCard.styles'

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
