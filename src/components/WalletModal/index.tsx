import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { usePrevious } from 'react-use'
import styled from 'styled-components'

import DxDao from '../../assets/images/dxdao.svg'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { getConnection } from '../../connectors/utils'
import { useWeb3ReactCore } from '../../hooks/useWeb3ReactCore'
import { AppState } from '../../state'
import { ApplicationModal } from '../../state/application/actions'
import { useCloseModals, useModalOpen, useWalletSwitcherPopoverToggle } from '../../state/application/hooks'
import { TYPE } from '../../theme'
import Modal from '../Modal'
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

const Blurb = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.bg1};
  height: 76px;
  position: relative;
  overflow: hidden;

  img {
    position: absolute;
    width: 80%;
  }
`

const HoverText = styled.div`
  :hover {
    cursor: pointer;
  }
`

export default function WalletModal() {
  const { account, connector, isActive, connectorError, tryActivation } = useWeb3ReactCore()
  const isConnectorError = !!connectorError

  const previousAccount = usePrevious(account)
  const previousConnector = usePrevious(connector)

  const isWalletPendingModalOpen = useModalOpen(ApplicationModal.WALLET_PENDING)
  const { pending, selected } = useSelector((state: AppState) => state.user.connector)
  const pendingConnector = pending ? getConnection(pending).connector : undefined
  const closeModal = useCloseModals()
  const toggleWalletSwitcherPopover = useWalletSwitcherPopoverToggle()
  const onBackButtonClick = () => {
    closeModal()
    toggleWalletSwitcherPopover()
  }

  // close pending wallet modal
  useEffect(() => {
    if (
      isWalletPendingModalOpen &&
      (pending === selected ||
        (account && !previousAccount) ||
        (previousAccount && previousAccount !== account) ||
        (connector && connector !== previousConnector && !isConnectorError))
    ) {
      closeModal()
    }
  }, [
    account,
    previousAccount,
    closeModal,
    isWalletPendingModalOpen,
    pending,
    selected,
    isActive,
    connector,
    previousConnector,
    isConnectorError,
  ])

  function getModalContent() {
    return (
      <UpperSection>
        <CloseIcon onClick={closeModal}>
          <CloseColor />
        </CloseIcon>
        <HeaderRow color="blue">
          <HoverText onClick={onBackButtonClick}>
            <TYPE.Body color="text4" fontWeight={500} fontSize="20px" lineHeight="24px" letterSpacing="-0.01em">
              Back
            </TYPE.Body>
          </HoverText>
        </HeaderRow>
        <ContentWrapper>
          {pendingConnector && (
            <PendingView connector={pendingConnector} error={isConnectorError} tryActivation={tryActivation} />
          )}
        </ContentWrapper>
        <Blurb as="a" href="https://dxdao.eth.limo/" rel="noopener noreferrer" target="_blank">
          <TYPE.Body fontWeight={700} fontSize="10px" color="text1" letterSpacing="3px" marginBottom="8px">
            A DXDAO PRODUCT
          </TYPE.Body>
          <TYPE.Body fontWeight={600} fontSize="8px" color="text5" letterSpacing="2px">
            DXDAO.ETH
          </TYPE.Body>
          <img src={DxDao} alt="dxdao" />
        </Blurb>
      </UpperSection>
    )
  }

  return (
    <Modal isOpen={isWalletPendingModalOpen} onDismiss={closeModal} minHeight={false} maxHeight={90}>
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  )
}
