import { ChainId, CoWTrade, Trade } from '@swapr/sdk'

import { AlertTriangle, ArrowUpCircle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Text } from 'rebass'
import styled, { useTheme } from 'styled-components'

import Circle from '../../assets/images/blue-loader.svg'
import { useActiveWeb3React } from '../../hooks'
import { CloseIcon, CustomLightSpinner, ExternalLink, TYPE } from '../../theme'
import { getExplorerLink, getGnosisProtocolExplorerOrderLink } from '../../utils'
import { ButtonPrimary } from '../Button'
import { AutoColumn, ColumnCenter } from '../Column'
import Modal from '../Modal'
import { RowBetween } from '../Row'

const Wrapper = styled.div`
  width: 100%;
`

const Section = styled(AutoColumn)`
  background-color: ${({ theme }) => theme.bg2};
  padding: 24px;
`

const BottomSection = styled(Section)`
  background-color: ${({ theme }) => theme.bg1};
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 10px 0;
`

export function ConfirmationPendingContent({ onDismiss, pendingText }: { onDismiss: () => void; pendingText: string }) {
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <div />
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <ConfirmedIcon>
          <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify={'center'}>
          <Text fontWeight={500} fontSize={20}>
            Waiting For Confirmation
          </Text>
          <AutoColumn gap="12px" justify={'center'}>
            <Text fontWeight={600} fontSize={14} color="" textAlign="center">
              {pendingText}
            </Text>
          </AutoColumn>
          <Text fontSize={12} color="#565A69" textAlign="center">
            Confirm this transaction in your wallet
          </Text>
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

function TransactionSubmittedContent({
  trade,
  onDismiss,
  chainId,
  hash,
}: {
  trade?: Trade
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
}) {
  const theme = useTheme()
  const { t } = useTranslation('common')

  const isCoWTrade = trade instanceof CoWTrade
  const link =
    chainId &&
    hash &&
    (isCoWTrade ? getGnosisProtocolExplorerOrderLink(chainId, hash) : getExplorerLink(chainId, hash, 'transaction'))

  const externalLinkText = `${isCoWTrade ? t('viewOnCowExplorer') : t('viewOnBlockExplorer')}`
  const explorerExternalLink = chainId && hash && (
    <ExternalLink href={link as string}>
      <Text fontWeight={500} fontSize="13px">
        {externalLinkText}
      </Text>
    </ExternalLink>
  )

  return (
    <Wrapper data-testid="transaction-confirmed-modal">
      <Section>
        <RowBetween>
          <div />
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <ConfirmedIcon>
          <ArrowUpCircle strokeWidth={0.5} size={90} color={theme.white} />
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify={'center'}>
          <Text fontWeight={500} fontSize="22px">
            Transaction Submitted
          </Text>
          {explorerExternalLink}
          <ButtonPrimary onClick={onDismiss} style={{ margin: '20px 0 0 0' }} data-testid="close-modal-button">
            <Text fontWeight={600} fontSize="13px">
              Close
            </Text>
          </ButtonPrimary>
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent,
}: {
  title: string
  onDismiss: () => void
  topContent: () => React.ReactNode
  bottomContent: () => React.ReactNode
}) {
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <TYPE.MediumHeader color="text4">{title}</TYPE.MediumHeader>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        {topContent()}
      </Section>
      <BottomSection gap="12px">{bottomContent()}</BottomSection>
    </Wrapper>
  )
}

export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const theme = useTheme()
  return (
    <Wrapper data-testid="transaction-error-modal">
      <Section>
        <RowBetween>
          <TYPE.MediumHeader color="text4">Error</TYPE.MediumHeader>
          <CloseIcon data-testid="close-icon" onClick={onDismiss} />
        </RowBetween>
        <AutoColumn style={{ marginTop: 20, padding: '2rem 0' }} gap="24px" justify="center">
          <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
          <Text fontWeight={500} fontSize={16} color={theme.red1} style={{ textAlign: 'center', width: '85%' }}>
            {message}
          </Text>
        </AutoColumn>
      </Section>
      <BottomSection gap="12px">
        <ButtonPrimary onClick={onDismiss}>Dismiss</ButtonPrimary>
      </BottomSection>
    </Wrapper>
  )
}

interface ConfirmationModalProps {
  isOpen: boolean
  onDismiss: () => void
  hash: string | undefined
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText: string
  trade?: Trade
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  trade,
}: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React()

  if (!chainId) return null

  // confirmation screen
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      {attemptingTxn ? (
        <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
      ) : hash ? (
        <TransactionSubmittedContent chainId={chainId} hash={hash} onDismiss={onDismiss} trade={trade} />
      ) : (
        content()
      )}
    </Modal>
  )
}
