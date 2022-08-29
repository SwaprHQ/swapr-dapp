import { ExternalLink } from 'react-feather'
import { Flex, Link, Text } from 'rebass'
import styled from 'styled-components'

import { ButtonPurpleDim } from '../../components/Button'
import Logo from '../../components/Logo'
import { ListLayout } from '../../ui/ListLayout'
import { TransactionStatus } from './Account.types'

export const Status = styled(Flex)<{ status: string }>`
  text-transform: uppercase;
  padding: 4px;
  font-size: 9px;
  border-radius: 6px;
  font-weight: 700;
  border-width: 1.5px;
  ${({ status }) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
      case TransactionStatus.CONFIRMED:
      case TransactionStatus.CLAIMED:
        return `
        border-color: #0e9f6e;
        color: #0e9f6e;`
      case TransactionStatus.REDEEM:
      case TransactionStatus.PENDING:
      case TransactionStatus.LOADING:
        return `
        border-color: #F2994A;
        color: #F2994A;`
      case TransactionStatus.CANCELLED:
      case TransactionStatus.FAILED:
        return `
        border-color: #F02E51;
        color: #F02E51;`
      default:
        return `
        border-color: #a7a0e4;
        color: #a7a0e4;`
    }
  }};
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
  align-items: center;
  :hover,
  :active,
  :focus {
    text-decoration: none;
    color: ${({ theme }) => theme.text2};
  }
`

export const GridCard = styled(Flex)<{ status?: string }>`
  padding: 24px 22px;
  line-height: 18px;
  align-items: center;
  color: #c0baf6;
  border-bottom: 1px solid #3e4259;
  font-size: 16px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px 10px;
    &:last-of-type {
      border-radius: 12px;
    }
    flex-wrap: wrap;
    gap: 12px 4px;
    font-size: 14px;
  `};
  background: ${({ status }) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
      case TransactionStatus.CONFIRMED:
      case TransactionStatus.CLAIMED:
        return 'linear-gradient(256.45deg, rgba(15, 152, 106, 0.2) 7%, rgba(15, 152, 106, 0) 66%)'
      case TransactionStatus.REDEEM:
      case TransactionStatus.PENDING:
      case TransactionStatus.LOADING:
        return 'linear-gradient(256.45deg, rgba(242, 153, 74, 0.2) 9%, rgba(242, 153, 74, 0) 56%)'
      case TransactionStatus.CANCELLED:
      case TransactionStatus.FAILED:
        return 'linear-gradient(256.45deg, rgba(240, 46, 81, 0.2) 2%, rgba(240, 46, 81, 0) 62%)'
      default:
        return 'inherit'
    }
  }};
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

export const TokenDetails = styled(Flex)`
  flex: 15%;
  min-width: 100px !important;
  width: 40%;
  justify-content: start;
  align-items: center;
  padding-right: 8px;
  text-transform: uppercase;
`

export const TransactionDetails = styled(Flex)`
  flex: 10%;
  min-width: 80px !important;
  justify-content: center;
  align-items: center;
  padding-right: 8px;
  text-transform: uppercase;
`

export const TypeDetails = styled(TransactionDetails)`
  flex-direction: column;
  font-size: 10px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    align-items: start;
  `}
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
  font-size: 12px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 9px;
  `};
  line-height: 12px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  font-feature-settings: 'tnum' on, 'lnum' on, 'zero' on;
  color: #8780bf;
`

export const Button = styled(ButtonPurpleDim)`
  width: fit-content;
  padding: 7px 12px;
  line-height: 12px;
  font-size: 10px;
  backdrop-filter: none;
  &:hover,
  &:active,
  &:focus {
    text-decoration: none;
    color: #ebe9f8;
  }
`

export const ENSAvatar = styled.div<{ url: string }>`
  height: calc(100% - 4px);
  width: calc(100% - 4px);
  border-radius: calc(100% - 4px);
  background-color: ${({ theme }) => theme.bg1};
  background-size: cover;
  background-image: ${({ url }) => `url(${url})`};
`

export const AvatarWrapper = styled.div`
  background-color: #48436d;
  height: 120px;
  width: 120px;
  border-radius: 120px;
  aspect-ratio: 1;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      height: 90px;
      width: 90px;
      border-radius: 90px;
  `};
  display: flex;
  justify-content: center;
  align-items: center;
`

export const DetailActionWrapper = styled(Flex)`
  margin-top: 8px !important;
  text-transform: uppercase;
  font-size: 10px;

  & > * {
    margin-left: 16px !important;
  }
  & :first-child {
    margin-left: 0 !important;
  }
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  & > * {
    margin-left: 12px !important;
  }
`};
`

export const CallToActionWrapper = styled(Flex)`
  margin-top: 12px !important;
  & > * {
    margin-left: 12px !important;
  }
  & :first-child {
    margin-left: 0 !important;
  }
`

export const NetworkName = styled(Flex)`
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
`

export const NetworkLink = styled(Link)`
  color: #c0baf6;
  cursor: pointer;
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  & > svg {
    margin-right: 4px;
  }
  &:hover,
  &:active,
  &:focus {
    text-decoration: none;
    color: #ebe9f8;
    & > svg {
      color: #ebe9f8;
    }
  }
`
