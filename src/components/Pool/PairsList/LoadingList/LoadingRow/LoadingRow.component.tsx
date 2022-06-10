import React from 'react'
import Skeleton from 'react-loading-skeleton'
import { Flex } from 'rebass'

import { useIsMobileByMedia } from '../../../../../hooks/useIsMobileByMedia'
import DoubleCurrencyLogo from '../../../../DoubleLogo'
import { Row } from './LoadingRow.styles'

export function LoadingRow() {
  const isMobile = useIsMobileByMedia()

  return (
    <Row flexWrap="wrap" justifyContent="space-between" padding={isMobile ? '22px 10px' : '22px'}>
      <Flex flex={isMobile ? '' : '25%'} flexDirection="row" alignItems="center">
        <DoubleCurrencyLogo spaceBetween={0} marginLeft={0} marginRight={14} top={0} loading size={45} />
        <Flex justifyContent="flex-start" flexDirection="column">
          <Skeleton height="20px" width="35px" />

          <Skeleton height="20px" width="48px" />
        </Flex>
      </Flex>
      <Flex flex={isMobile ? '' : '25%'} flexDirection="column" alignItems="flex-start" justifyContent="space-evenly">
        <Flex style={{ gap: '6px' }} flexDirection="row" alignItems="flex-start" flexWrap="wrap">
          <Skeleton height="15px" width="66px" />
          <Skeleton style={{ marginLeft: '4px' }} height="15px" width="65px" />
        </Flex>
      </Flex>
      <Flex flex={isMobile ? '100%' : '45%'} justifyContent="space-between">
        <Flex alignItems="center" flex={isMobile ? '' : '30%'}>
          <Skeleton height="17px" width="91px" />
        </Flex>
        <Flex alignItems="center" flex={isMobile ? '' : '30%'}>
          <Skeleton height="17px" width="91px" />
        </Flex>
        <Flex alignItems="center" flex={isMobile ? '' : '10%'}>
          <Skeleton height="22px" width="48px" />
        </Flex>
      </Flex>
    </Row>
  )
}
