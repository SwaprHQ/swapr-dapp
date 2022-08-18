import { ExternalLink } from 'react-feather'
import { Flex, Link, Text } from 'rebass'
import styled from 'styled-components'

import { ButtonPurpleDim } from '../../components/Button'
import Logo from '../../components/Logo'
import { ListLayout } from '../../ui/ListLayout'

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

export const HeaderRow = styled(ListLayout)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
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

export const GridCard = styled(Flex)<{ status?: string }>`
  row-gap: 24px;
  padding: 16px 22px;
  font-size: 14px;
  line-height: 18px;
  align-items: center;
  color: #c0baf6;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px 10px;
    &:last-of-type {
      border-radius: 12px;
    }
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

  border-bottom: 1px solid #3e4259;

  &:last-of-type {
    border-bottom-right-radius: 12px;
    border-bottom-left-radius: 12px;
    border-bottom: none;
  }
`
export const TokenRow = styled(Flex)`
  flex: 15%;
  justify-content: end;
  align-items: center;
  padding-right: 8px;
`

export const TranasctionDetails = styled(Flex)`
  flex: 10%;
  justify-content: center;
  align-items: center;
  padding-right: 8px;
`

export const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
`

export const PaginationRow = styled(Flex)`
  width: 100%;
  justify-content: flex-end;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    justify-content: center;
  `};

  & ul {
    margin: 22px 0;
  }
`

export const FullAccount = styled(Text)`
  font-weight: 500;
  font-size: 10px;
  line-height: 12px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  font-feature-settings: 'tnum' on, 'lnum' on, 'zero' on;
  color: #8780bf;
  margin-top: 4px;
`

export const Button = styled(ButtonPurpleDim)`
  max-width: 'fit-content';
  width: fit-content;
  padding: 7px 12px;
  line-height: 12px;
  font-size: 10px;
  letter-spacing: 0.04em;
  font-weight: 500;
  color: #a7a0e4;
  &:last-of-type {
    margin-left: 12px;
  }
  &:hover,
  &:active,
  &:focus {
    text-decoration: none;
    color: #ebe9f8;
  }
`
