import React from 'react'
import styled from 'styled-components'
import Skeleton from 'react-loading-skeleton'
import { DarkCard } from '../../../Card'
import { Box, Flex } from 'rebass'
import DoubleCurrencyLogo from '../../../DoubleLogo'

const SizedCard = styled(DarkCard)`
  width: 100%;
  height: 80px;
  padding: 17px 20px;
`

export default function LoadingCard() {
  return (
    <SizedCard selectable>
      <Flex alignItems="center" flexDirection="row" justifyContent="space-between" height="100%">
        <Flex height="100%" alignItems="center" justifyContent="flex-start">
          <Flex>
            <Box>
              <DoubleCurrencyLogo loading size={45} />
            </Box>
          </Flex>

          <Flex height="100%" justifyContent="space-around" ml="8px" flexDirection="column">
            <Flex alignItems="center">
              <Box style={{ marginRight: '6px' }}>
                <Skeleton height="20px" width="90px" />
              </Box>
              <Box>
                <Skeleton height="15px" width="68px" />
              </Box>
            </Flex>
            <Flex alignItems="center">
              <Box style={{ marginRight: '6px' }}>
                <Skeleton height="14px" width="137px" />
              </Box>
              <Box style={{ marginBottom: '-5px' }}>
                <Skeleton height="9px" width="44px" />
              </Box>
            </Flex>
          </Flex>
        </Flex>
        <Flex flexDirection="column" justifyContent="flex-end">
          <Box>
            <Skeleton height="32px" width="154px" />
          </Box>
        </Flex>
      </Flex>
    </SizedCard>
  )
}
