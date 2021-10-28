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
  ${props => props.theme.mediaWidth.upToExtraSmall`
   height:128px;
       overflow: hidden;
  `};
`
const MobileHidden = styled(Box)`
  display: flex;
  align-items: center;
  min-width: auto !important;
  ${props => props.theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`
const DesktopHidden = styled(Box)`
  display: none;
  ${props => props.theme.mediaWidth.upToExtraSmall`
    display: block;
  `}
`
const ResponsiveLogoAndTextWrapper = styled(Flex)`
  ${props => props.theme.mediaWidth.upToExtraSmall`
   flex-direction:column;
   height:auto;
  `}
`
const BottomFlex = styled(Flex)`
  ${props => props.theme.mediaWidth.upToExtraSmall`
    align-self:flex-start;
  `};
`

export default function LoadingCard() {
  return (
    <SizedCard selectable>
      <Flex alignItems="center" flexDirection="row" justifyContent="space-between" height="100%">
        <ResponsiveLogoAndTextWrapper height="100%" alignItems="center" justifyContent="flex-start">
          <Flex>
            <Box>
              <DesktopHidden>
                <DoubleCurrencyLogo loading marginLeft={-101} top={-27} size={64} />
              </DesktopHidden>
              <MobileHidden>
                <DoubleCurrencyLogo loading size={45} />
              </MobileHidden>
            </Box>
          </Flex>

          <Flex height="100%" justifyContent="space-around" ml="8px" flexDirection="column">
            <Flex alignItems="center">
              <Box style={{ marginRight: '6px' }}>
                <Skeleton height="20px" width="90px" />
              </Box>
              <MobileHidden>
                <Box>
                  <Skeleton height="15px" width="68px" />
                </Box>
              </MobileHidden>
            </Flex>
            <Flex alignItems="center">
              <Box style={{ marginRight: '6px' }}>
                <Skeleton height="14px" width="137px" />
              </Box>
              <MobileHidden>
                <Box style={{ marginBottom: '-5px' }}>
                  <Skeleton height="9px" width="44px" />
                </Box>
              </MobileHidden>
            </Flex>
          </Flex>
        </ResponsiveLogoAndTextWrapper>
        <BottomFlex flexDirection="column" justifyContent="flex-end">
          <Box>
            <DesktopHidden>
              <Box style={{ marginRight: '6px' }}>
                <Skeleton height="14px" width="137px" />
              </Box>
            </DesktopHidden>
            <MobileHidden>
              <Skeleton height="32px" width="154px" />
            </MobileHidden>
          </Box>
        </BottomFlex>
      </Flex>
    </SizedCard>
  )
}
