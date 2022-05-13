import React from 'react'
import Skeleton from 'react-loading-skeleton'
import { Flex } from 'rebass'
import DoubleCurrencyLogo from '../../../DoubleLogo'
import { Row } from './LoadingRow.styles'

export function LoadingRow() {
  return (
    <Row>
      <Flex alignItems="center" flexDirection="row">
        <DoubleCurrencyLogo spaceBetween={0} marginLeft={0} marginRight={14} top={0} loading size={45} />
        <Flex justifyContent="flex-start" flexDirection="column">
          <Skeleton height="20px" width="35px" />

          <Skeleton height="20px" width="48px" />
        </Flex>
      </Flex>
      <Flex alignItems="center">
        <Skeleton height="15px" width="66px" />
        <Skeleton style={{ marginLeft: '4px' }} height="15px" width="65px" />
      </Flex>
      <Flex alignItems="center">
        <Skeleton height="17px" width="91px" />
      </Flex>
      <Flex alignItems="center">
        <Skeleton height="17px" width="91px" />
      </Flex>
      <Flex alignItems="center">
        <Skeleton height="22px" width="48px" />
      </Flex>
    </Row>
  )
}
