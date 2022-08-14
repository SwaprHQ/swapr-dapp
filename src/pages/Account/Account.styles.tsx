import { ExternalLink } from 'react-feather'
import { Flex, Link } from 'rebass'
import styled from 'styled-components'

import Logo from '../../components/Logo'

export const Status = styled(Flex)<{ status: string }>`
  text-transform: uppercase;
  padding: 4px;
  font-size: 9px;
  border-radius: 6px;
  color: #0e9f6e;
  font-weight: 700;
  border-width: 1.5px;
  border-color: #0e9f6e;
  border-style: solid;
  height: fit-content;
  line-height: 1;
`

export const CustomLinkIcon = styled(ExternalLink)`
  color: ${({ theme }) => theme.text5};
`

export const StyledLink = styled(Link)`
  font-size: inherit;
  display: flex;
  color: ${({ theme }) => theme.text4};
  margin-left: 4px;
  align-items: center;
  :hover,
  :active,
  :focus {
    text-decoration: none;
    color: ${({ theme }) => theme.text2};
  }
`

export const GridCard = styled(Flex)<{ status: string }>`
  row-gap: 24px;
  padding: 16px;
  font-size: 14px;
  line-height: 18px;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px 10px
  `};
  background: ${({ status }) => {
    switch (status) {
      case 'COMPLETED':
        return 'linear-gradient(256.45deg, rgba(15, 152, 106, 0.2) 6.32%, rgba(15, 152, 106, 0) 65.79%)'
      case 'PENDING':
        return 'linear-gradient(256.45deg, rgba(242, 153, 74, 0.2) 8.84%, rgba(242, 153, 74, 0) 55.62%)'
      default:
        return 'inherit'
    }
  }};
  border-bottom: 1px solid #41414129;
`
export const TokenRow = styled(Flex)`
  padding-right: 8px;
  justify-content: end;
  flex: 14%;
  align-items: center;
`

export const TokenDetails = styled(Flex)`
  flex: 15%;
  justify-content: center;
  align-items: center;
`

export const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
`
