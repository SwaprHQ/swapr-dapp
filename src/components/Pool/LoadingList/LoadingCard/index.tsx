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
  width: 70%;

  ${props => props.theme.mediaWidth.upToExtraSmall`
    align-self:flex-start;
    width:auto;
    
  `};
`
const ResponsiveText = styled(Flex)`
  justify-content: flex-start;
  flex-direction: column;

  ${props => props.theme.mediaWidth.upToExtraSmall`
   flex-direction:row;
   align-self: flex-start;
   margin-left:0 !important;
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
                <DoubleCurrencyLogo spaceBetween={-12} loading marginLeft={-101} top={-27} size={64} />
              </DesktopHidden>
              <MobileHidden>
                <DoubleCurrencyLogo spaceBetween={-12} loading size={45} />
              </MobileHidden>
            </Box>
          </Flex>

          <ResponsiveText ml="25px" height="100%">
            <Skeleton height="20px" width="35px" />

            <Skeleton height="20px" width="48px" />
          </ResponsiveText>
          <DesktopHidden>
            <Skeleton height="14px" width="132px" />
          </DesktopHidden>
        </ResponsiveLogoAndTextWrapper>
        <BottomFlex flexDirection="column">
          <DesktopHidden>
            <Skeleton height="14px" width="137px" />
          </DesktopHidden>
          <MobileHidden style={{ justifyContent: 'space-around' }}>
            <Flex flexDirection="column">
              <Skeleton height="12px" width="73px" />
              <Flex alignItems="center">
                <Skeleton height="15px" width="66px" />
                <Skeleton style={{ marginLeft: '4px' }} height="15px" width="65px" />
              </Flex>
            </Flex>

            <Flex flexDirection="column">
              <Skeleton height="12px" width="23px" />
              <Skeleton height="17px" width="91px" />
            </Flex>
            <Flex flexDirection="column">
              <Skeleton height="12px" width="79px" />
              <Skeleton height="17px" width="112px" />
            </Flex>
            <Flex flexDirection="column">
              <Skeleton height="12px" width="23px" />
              <Skeleton height="22px" width="48px" />
            </Flex>
          </MobileHidden>
        </BottomFlex>
      </Flex>
    </SizedCard>
  )
}
