import React from 'react'
import { Text } from 'rebass'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useSimpleSettingsModal } from '../../state/application/hooks'
import {
  useUserTransactionTTL,
  useUserSlippageTolerance,
  useUserPreferredGasPrice,
  useMultihopManager
} from '../../state/user/hooks'
import { CloseIcon } from '../../theme'
import TransactionSettings from '../TransactionSettings'

import {
  MenuModal,
  MenuModalContent,
  MenuModalContentWrapper,
  MenuModalHeader,
  MenuModalInner,
  StyledMenuIconContainer,
  StyledMenuIcon,
  StyledMenu
} from './MenuModal'

export function SimpleSettings() {
  const open = useModalOpen(ApplicationModal.SIMPLE_SETTINGS)
  const toggleTransactionSettings = useSimpleSettingsModal()
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance()
  const [userPreferredGasPrice, setUserPreferredGasPrice] = useUserPreferredGasPrice()
  const [ttl, setTtl] = useUserTransactionTTL()
  const [multihop, toggleMultihop] = useMultihopManager()

  return (
    <>
      <StyledMenu onClick={toggleTransactionSettings} id="open-settings-dialog-button">
        <StyledMenuIconContainer>
          <StyledMenuIcon />
        </StyledMenuIconContainer>
        <MenuModal isOpen={open} onDismiss={toggleTransactionSettings}>
          <MenuModalContentWrapper>
            <MenuModalHeader>
              <Text fontWeight="400" fontSize="14px" lineHeight="17px">
                Transaction settings
              </Text>
              <CloseIcon onClick={toggleTransactionSettings} />
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
              </MenuModalInner>
            </MenuModalContent>
          </MenuModalContentWrapper>
        </MenuModal>
      </StyledMenu>
    </>
  )
}
