import { Token } from '@swapr/sdk'

import { TokenList } from '@uniswap/token-lists'
import { transparentize } from 'polished'
import { useCallback } from 'react'
import { AlertCircle, AlertTriangle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { useActiveWeb3React } from '../../hooks'
import { ExternalLink, TYPE } from '../../theme'
import { getExplorerLink, shortenAddress } from '../../utils'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import { CurrencyLogo } from '../CurrencyLogo'
import ListLogo from '../ListLogo'
import Modal from '../Modal'
import { AutoRow, RowFixed } from '../Row'

const WarningContainer = styled.div`
  width: 100%;
  overflow: auto;
`

const OuterContainer = styled.div`
  background: ${({ theme }) => theme.bg1And2};
`

const UpperSectionContainer = styled.div`
  padding: 20px;
`

const BottomSectionContainer = styled.div`
  background: ${({ theme }) => theme.bg1};
  padding: 20px;
`

const StyledWarningIcon = styled(AlertTriangle)`
  stroke: ${({ theme }) => theme.text3};
`

const WarningWrapper = styled.div`
  border-radius: 4px;
  padding: 4px;
  background-color: ${({ theme }) => transparentize(0.8, theme.red1)};
`

const SpacedButtonError = styled(ButtonError)`
  margin-top: 24px;
`

interface TokenWarningCardProps {
  token?: Token
  list?: TokenList
}

export function TokenWarningCard({ token, list }: TokenWarningCardProps) {
  const theme = useTheme()
  const { t } = useTranslation('common')
  const { chainId } = useActiveWeb3React()

  if (!token) return null

  return (
    <AutoRow gap="6px">
      <AutoColumn gap="24px">
        <CurrencyLogo currency={token} size={'16px'} />
        <div> </div>
      </AutoColumn>
      <AutoColumn gap="11px" justify="flex-start">
        <TYPE.Main fontSize="16px" lineHeight="20px">
          {token && token.name && token.symbol && token.name !== token.symbol
            ? `${token.name} (${token.symbol})`
            : token.name || token.symbol}{' '}
        </TYPE.Main>
        {chainId && (
          <ExternalLink
            color="purple4"
            style={{ fontWeight: 400 }}
            href={getExplorerLink(chainId, token.address, 'token')}
          >
            <TYPE.Main color="purple4" fontSize="14px" lineHeight="17px" title={token.address}>
              {shortenAddress(token.address)} ({t('viewOnBlockExplorer')})
            </TYPE.Main>
          </ExternalLink>
        )}
        {list !== undefined ? (
          <RowFixed>
            {list.logoURI && <ListLogo logoURI={list.logoURI} defaultText={list.name} size="16px" />}
            <TYPE.Small ml="6px" fontSize={14} color={theme.text3}>
              via {list.name} token list
            </TYPE.Small>
          </RowFixed>
        ) : (
          <WarningWrapper>
            <RowFixed>
              <AlertCircle stroke={theme.red1} size="10px" />
              <TYPE.Body color={theme.red1} ml="4px" fontSize="10px" fontWeight={500}>
                Unknown Source
              </TYPE.Body>
            </RowFixed>
          </WarningWrapper>
        )}
      </AutoColumn>
    </AutoRow>
  )
}

export default function TokenWarningModal({
  isOpen,
  tokens,
  onConfirm,
}: {
  isOpen: boolean
  tokens: Token[]
  onConfirm: () => void
}) {
  const handleDismiss = useCallback(() => null, [])
  return (
    <Modal isOpen={isOpen} onDismiss={handleDismiss} maxHeight={90}>
      <OuterContainer>
        <WarningContainer className="token-warning-container">
          <AutoColumn>
            <UpperSectionContainer>
              <AutoRow gap="6px">
                <StyledWarningIcon size="20px" />
                <TYPE.Main fontSize="16px" lineHeight="22px" color={'text3'}>
                  Token imported
                </TYPE.Main>
              </AutoRow>
              <TYPE.Body
                marginY="20px"
                fontSize="14px"
                fontWeight="400"
                lineHeight="22px"
                letterSpacing="-0.02em"
                color="text4"
              >
                Anyone can create an ERC20 token on Ethereum with <em>any</em> name, including creating fake versions of
                existing tokens and tokens that claim to represent projects that do not have a token.
              </TYPE.Body>
              <TYPE.Body
                marginBottom="20px"
                fontSize="14px"
                fontWeight="400"
                lineHeight="22px"
                letterSpacing="-0.02em"
                color="text4"
              >
                This interface can load arbitrary tokens by token addresses. Please take extra caution and do your
                research when interacting with arbitrary ERC20 tokens.
              </TYPE.Body>
              <TYPE.Body fontSize="14px" fontWeight="400" lineHeight="22px" letterSpacing="-0.02em" color="text4">
                If you purchase an arbitrary token, <strong>you may be unable to sell it back.</strong>
              </TYPE.Body>
            </UpperSectionContainer>
            <BottomSectionContainer>
              {tokens.map(token => {
                return <TokenWarningCard key={token.address} token={token} />
              })}
              <SpacedButtonError
                error
                className="token-dismiss-button"
                onClick={() => {
                  onConfirm()
                }}
              >
                <TYPE.Body color="white">I understand</TYPE.Body>
              </SpacedButtonError>
            </BottomSectionContainer>
          </AutoColumn>
        </WarningContainer>
      </OuterContainer>
    </Modal>
  )
}
