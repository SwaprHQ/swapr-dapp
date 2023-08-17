import { useWeb3React } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { useCallback, useEffect } from 'react'
import { AlertTriangle } from 'react-feather'
import { usePrevious } from 'react-use'
import styled from 'styled-components'

import { ReactComponent as Close } from '../../assets/images/x.svg'
import { useUnsupportedChainIdError } from '../../hooks'
import { useWalletSwitcherPopoverToggle } from '../../state/application/hooks'
import { TYPE } from '../../theme'
import Modal from '../Modal'
import { AutoRow } from '../Row'
import { ModalView } from '../Web3Status'

import PendingView from './PendingView'
const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  cursor: pointer;
`

const CloseColor = styled(Close)`
  width: 16px;
  height: 16px;
  color: ${({ theme }) => theme.text3};
`

const StyledWarningIcon = styled(AlertTriangle)`
  stroke: ${({ theme }) => theme.text3};
`

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1rem 1.125rem 0 1.125rem;
  font-weight: 500;
  color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const ContentWrapper = styled.div`
  padding: 16px 18px 32px 16px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;

  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`

const UpperSection = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.bg1And2};

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`

const HoverText = styled.div`
  :hover {
    cursor: pointer;
  }
`

interface WalletModalProps {
  modal: ModalView | null
  setModal: (modal: ModalView | null) => void
  tryActivation: (connector: Connector | undefined) => void
  pendingError: boolean | undefined
  setPendingError: (value: boolean) => void
  pendingWallet: Connector | undefined
}

export default function WalletModal({
  modal,
  setModal,
  tryActivation,
  pendingError,
  setPendingError,
  pendingWallet,
}: WalletModalProps) {
  const { isActive, account, connector } = useWeb3React()
  const isUnsupportedChainIdError = useUnsupportedChainIdError()

  const closeModal = useCallback(() => setModal(null), [setModal])

  const isModalVisible = modal !== null

  const previousAccount = usePrevious(account)

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && isModalVisible) {
      closeModal()
    }
  }, [account, previousAccount, closeModal, isModalVisible])

  // close on wallet change
  useEffect(() => {
    if (account && previousAccount && previousAccount !== account && isModalVisible) {
      closeModal()
    }
  }, [account, previousAccount, closeModal, isModalVisible])

  const activePrevious = usePrevious(isActive)
  const connectorPrevious = usePrevious(connector)
  useEffect(() => {
    if (
      !!modal &&
      ((isActive && !activePrevious) || (connector && connector !== connectorPrevious && !isUnsupportedChainIdError))
    ) {
      setModal(null)
    }
  }, [setModal, isActive, connector, modal, activePrevious, connectorPrevious, isUnsupportedChainIdError])

  const toggleWalletSwitcherPopover = useWalletSwitcherPopoverToggle()
  const onBackButtonClick = () => {
    setPendingError(false)
    setModal(null)
    toggleWalletSwitcherPopover()
  }

  function getModalContent() {
    if (isUnsupportedChainIdError) {
      return (
        <UpperSection>
          <CloseIcon onClick={closeModal}>
            <CloseColor />
          </CloseIcon>
          <HeaderRow>
            <AutoRow gap="6px">
              <StyledWarningIcon size="20px" />
              <TYPE.Main fontSize="16px" lineHeight="22px" color={'text3'}>
                Wrong Network
              </TYPE.Main>
            </AutoRow>
          </HeaderRow>
          <ContentWrapper>
            <TYPE.Yellow color="text4">
              <h5>Please connect to the appropriate network.</h5>
            </TYPE.Yellow>
          </ContentWrapper>
        </UpperSection>
      )
    }

    return (
      <UpperSection>
        <CloseIcon onClick={closeModal}>
          <CloseColor />
        </CloseIcon>
        {modal !== ModalView.Account ? (
          <HeaderRow color="blue">
            <HoverText onClick={onBackButtonClick}>
              <TYPE.Body color="text4" fontWeight={500} fontSize="20px" lineHeight="24px" letterSpacing="-0.01em">
                Back
              </TYPE.Body>
            </HoverText>
          </HeaderRow>
        ) : (
          <HeaderRow>
            <TYPE.Body fontWeight={500} fontSize={20} color="text4">
              Connect to a wallet
            </TYPE.Body>
          </HeaderRow>
        )}
        <ContentWrapper>
          <PendingView
            connector={pendingWallet}
            error={pendingError}
            setPendingError={setPendingError}
            tryActivation={tryActivation}
          />
        </ContentWrapper>
      </UpperSection>
    )
  }

  return (
    <Modal isOpen={isModalVisible} onDismiss={closeModal} minHeight={false} maxHeight={90}>
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  )
}
