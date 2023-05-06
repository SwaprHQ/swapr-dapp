import { transparentize } from 'polished'
import { useState } from 'react'
import { Code, MessageCircle, Settings as SettingsIcon, X } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components'

import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useSimpleSettingsModal, useToggleSettingsMenu } from '../../state/application/hooks'
import {
  useExpertModeManager,
  useMultihopManager,
  useUserPreferredGasPrice,
  useUserSlippageToleranceManager,
  useUserTransactionTTL,
} from '../../state/user/hooks'
import { CloseIcon, ExternalLink, LinkStyledButton, TYPE } from '../../theme'
import { ButtonError } from '../Button'
import { DarkCard } from '../Card'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import QuestionHelper from '../QuestionHelper'
import Row, { RowBetween, RowFixed } from '../Row'
import { SwaprVersionLogo } from '../SwaprVersionLogo'
import Toggle from '../Toggle'
import { TransactionSettings } from '../TransactionSettings'

const MenuModal = styled(Modal)`
  && {
    position: absolute;
    top: 95px;
    right: 20px;
    max-width: 322px;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      position: fixed;
      right: initial;
      justify-content: center;
      align-items: center;
    `};

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      max-width: 100%;
    `};
  }
`

const MenuModalHeader = styled(RowBetween)`
  @media only screen and (max-height: 600px) {
    padding: 24px 16px;
    box-shadow: 0px 16px 42px rgba(10, 10, 15, 0.45);
  }
`

const ModalContentWrapper = styled(DarkCard)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 26px 0;
  ::before {
    background-color: ${props => props.theme.bg1And2};
  }
`

const MenuModalContentWrapper = styled(ModalContentWrapper)`
  display: grid;
  grid-row-gap: 12px;
  padding: 20px;

  @media only screen and (max-height: 600px) {
    padding: 0;
    grid-gap: 0;
  }
`

const MenuModalContent = styled.div`
  overflow-y: auto;
  max-height: 60vh;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
  }
`

const MenuModalInner = styled.div`
  @media only screen and (max-height: 600px) {
    padding: 24px 16px;
  }
`

const StyledMenu = styled.button`
  height: 32px;
  width: 32px;
  border-radius: 12px;
  margin-left: 7px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
  background: ${({ theme }) => transparentize(1, theme.bg1)};
  cursor: pointer;
  outline: none;
`

const StyledMenuIconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 8px;
  height: 32px;
  width: 32px;
  cursor: pointer;
  background: ${props => props.theme.dark1};
  border-radius: 12px;
`

const StyledMenuIcon = styled(SettingsIcon)`
  height: 15px;
  width: 15px;

  > * {
    stroke: ${({ theme }) => theme.text4};
  }
`

const EmojiWrapper = styled.div`
  position: absolute;
  cursor: pointer;
  bottom: -6px;
  right: 3px;
  font-size: 12px;
`

const MenuItem = styled(ExternalLink)`
  width: 50%;
  color: ${({ theme }) => theme.text2};
  display: flex;
  justify-content: center;
  align-items: center;
  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
  }
  > svg {
    margin-right: 8px;
  }
`

const StyledCloseIcon = styled(X)`
  position: absolute;
  right: 18px;
  height: 20px;
  width: 20px;

  :hover {
    cursor: pointer;
  }

  > * {
    stroke: ${({ theme }) => theme.bg5};
  }
`

const CloseTextButton = styled(LinkStyledButton)`
  color: ${({ theme }) => theme.text4};
  font-size: 13px;
  text-decoration: underline;
`

const Divider = styled.div<{ horizontal?: boolean }>`
  border: 0.5px solid ${props => props.theme.bg2};
  height: ${props => (props.horizontal ? '100%' : 'auto')};
`

const CODE_LINK = 'https://github.com/ImpeccableHQ/swapr-dapp'

export function Settings({ simple }: { simple?: boolean }) {
  const open = useModalOpen(simple ? ApplicationModal.SIMPLE_SETTINGS : ApplicationModal.SETTINGS)
  const toggleSettings = useToggleSettingsMenu()
  const toggleSimpleSettings = useSimpleSettingsModal()
  const toggle = simple ? toggleSimpleSettings : toggleSettings

  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageToleranceManager()
  const [userPreferredGasPrice, setUserPreferredGasPrice] = useUserPreferredGasPrice()
  const [ttl, setTtl] = useUserTransactionTTL()
  const [expertMode, toggleExpertMode] = useExpertModeManager()
  const [multihop, toggleMultihop] = useMultihopManager()

  // show confirmation view before turning on
  const [showConfirmation, setShowConfirmation] = useState(false)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <>
      <Modal isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)} maxHeight={100}>
        {!simple && (
          <ModalContentWrapper>
            <AutoColumn gap="25px">
              <Row style={{ padding: '0 25px', justifyContent: 'center' }}>
                <TYPE.Body fontWeight={500} fontSize="20px" color="text3" data-testid="expert-mode-confirmation-window">
                  Are you sure?
                </TYPE.Body>
                <StyledCloseIcon onClick={() => setShowConfirmation(false)} />
              </Row>
              <AutoColumn gap="24px" style={{ padding: '0 24px' }}>
                <TYPE.Body fontWeight={400} fontSize="16px" lineHeight="20px" color="text1" textAlign="center">
                  Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result
                  in bad rates and lost funds.
                </TYPE.Body>
                <TYPE.Body fontWeight={600} fontSize="13px" color="text1" textAlign="center">
                  ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
                </TYPE.Body>
                <ButtonError
                  error={true}
                  padding={'18px'}
                  onClick={() => {
                    toggleExpertMode()
                    setShowConfirmation(false)
                  }}
                >
                  {
                    <TYPE.Body fontSize="13px" fontWeight={600} color="text1" id="confirm-expert-mode">
                      Turn on Expert mode
                    </TYPE.Body>
                  }
                </ButtonError>

                <Row style={{ justifyContent: 'center' }}>
                  <CloseTextButton onClick={() => setShowConfirmation(false)}>Cancel</CloseTextButton>
                </Row>
              </AutoColumn>
            </AutoColumn>
          </ModalContentWrapper>
        )}
      </Modal>
      <StyledMenu onClick={toggle} id="open-settings-dialog-button">
        <StyledMenuIconContainer>
          <StyledMenuIcon />
        </StyledMenuIconContainer>
        {!simple && expertMode && (
          <EmojiWrapper onClick={toggle}>
            <span role="img" aria-label="wizard-icon">
              😎
            </span>
          </EmojiWrapper>
        )}
        <MenuModal isOpen={open} onDismiss={toggle}>
          <MenuModalContentWrapper data-testid="settings-dialog">
            <MenuModalHeader>
              <Text fontWeight="400" fontSize="14px" lineHeight="17px">
                Transaction settings
              </Text>
              <CloseIcon onClick={toggle} />
            </MenuModalHeader>
            <MenuModalContent>
              <MenuModalInner>
                <TransactionSettings
                  rawSlippage={userSlippageTolerance}
                  setRawSlippage={setUserslippageTolerance}
                  rawPreferredGasPrice={userPreferredGasPrice}
                  setRawPreferredGasPrice={setUserPreferredGasPrice}
                  deadline={ttl}
                  setDeadline={setTtl}
                  multihop={multihop}
                  onMultihopChange={toggleMultihop}
                />

                {!simple && (
                  <>
                    <Text fontWeight="400" fontSize="14px" lineHeight="17px" marginTop="12px" marginBottom="8px">
                      Interface settings
                    </Text>
                    <RowBetween marginBottom="12px">
                      <RowFixed>
                        <TYPE.Body
                          color="text4"
                          fontWeight={500}
                          fontSize="12px"
                          lineHeight="15px"
                          data-testid="toggle-expert-mode-text"
                        >
                          Toggle expert mode
                        </TYPE.Body>
                        <QuestionHelper text="Bypasses confirmation modals and allows high slippage trades. Use at your own risk." />
                      </RowFixed>
                      <Toggle
                        id="toggle-expert-mode-button"
                        isActive={expertMode}
                        toggle={
                          expertMode
                            ? () => {
                                toggleExpertMode()
                                setShowConfirmation(false)
                              }
                            : () => {
                                simple ? toggleSimpleSettings() : toggleSettings()
                                setShowConfirmation(true)
                              }
                        }
                      />
                    </RowBetween>
                    <Divider />
                    <RowBetween width="100%" marginTop="12px" marginBottom="12px">
                      <MenuItem href={CODE_LINK} data-testid="code-hyperlink">
                        <Code size={14} />
                        Code
                      </MenuItem>
                      <MenuItem href="https://discord.com/invite/4QXEJQkvHH" data-testid="discord-hyperlink">
                        <MessageCircle size={14} />
                        Discord
                      </MenuItem>
                    </RowBetween>
                    <RowBetween alignItems="center" justify="center" marginBottom="8px">
                      <SwaprVersionLogo />
                    </RowBetween>
                  </>
                )}
              </MenuModalInner>
            </MenuModalContent>
          </MenuModalContentWrapper>
        </MenuModal>
      </StyledMenu>
    </>
  )
}
