import React from 'react'
import { Text, Box } from 'rebass'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import Skeleton from 'react-loading-skeleton'
import QuestionHelper from '../../components/QuestionHelper'
import { commonActions } from '../../services/EcoBridge/store/Common.reducer'
import { useActiveBridge, useAvailableBridges } from '../../services/EcoBridge/EcoBridge.hooks'
import { SyncState, BridgeList, OptionalBridgeList } from '../../services/EcoBridge/EcoBridge.types'
import {
  SelectionListWindowWrapper,
  SelectionListLabelWrapper,
  SelectionListLabel,
  SelectionListOption,
  SelectionListName,
  SelectionListDetails,
  SelectionListReceiveAmount,
} from '../../components/SelectionList'

export const BridgeSelectionWindow = () => {
  const dispatch = useDispatch()
  const activeBridge = useActiveBridge()
  const availableBridges = useAvailableBridges()

  const handleSelectBridge = (id: OptionalBridgeList) => {
    dispatch(commonActions.setActiveBridge(id))
  }

  return (
    <>
      {!!availableBridges.length && (
        <SelectionListWindowWrapper extraMarginTop="10px">
          <SelectionListLabelWrapper>
            <SelectionListLabel flex="35%" justify>
              Bridge
            </SelectionListLabel>
            <SelectionListLabel>Fee</SelectionListLabel>
            <SelectionListLabel>Gas</SelectionListLabel>
            <SelectionListLabel>Time</SelectionListLabel>
            <SelectionListLabel flex="22%">Amount</SelectionListLabel>
          </SelectionListLabelWrapper>
          {availableBridges.map(({ bridgeId, name, details, status }) => (
            <Bridge
              id={bridgeId}
              key={bridgeId}
              name={name}
              activeBridge={activeBridge}
              details={details}
              status={status}
              handleSelectBridge={handleSelectBridge}
            />
          ))}
        </SelectionListWindowWrapper>
      )}

      {!availableBridges.length && (
        <Box sx={{ margin: '15px 0', width: '100%' }}>
          <Text sx={{ textAlign: 'center', color: '#464366' }}>No available bridges</Text>
        </Box>
      )}
    </>
  )
}

interface BridgeProps {
  id: BridgeList
  name: string
  activeBridge: OptionalBridgeList
  details: {
    gas?: string
    fee?: string
    estimateTime?: string
    receiveAmount?: string
  }
  status: SyncState
  handleSelectBridge: (id: OptionalBridgeList) => void
}

const Bridge = ({ id, name, activeBridge, details, status, handleSelectBridge }: BridgeProps) => {
  const isSelected = id === activeBridge
  const isLoading = status === 'loading'
  const show = status !== 'loading' && details

  return (
    <SelectionListOption
      data-testid={name.toLowerCase() + '-bridge'}
      isSelected={isSelected}
      isLoading={isLoading}
      onClick={() => {
        if (!isLoading) {
          handleSelectBridge(id)
        }
      }}
    >
      <SelectionListName flex="35%" isSelected={isSelected}>
        {name}
      </SelectionListName>
      <SelectionListDetails data-testid="fee-amount">
        {!show ? (
          <Skeleton width="25px" height="9px" />
        ) : !details.fee ? (
          <QuestionHelperWarning text="Cannot estimate fee" />
        ) : (
          details.fee
        )}
      </SelectionListDetails>
      <SelectionListDetails data-testid="bridge-gas">
        {!show ? (
          <Skeleton width="25px" height="9px" />
        ) : !details.gas ? (
          <QuestionHelperWarning text="Cannot estimate gas" />
        ) : (
          details.gas
        )}
      </SelectionListDetails>
      <SelectionListDetails data-testid="estimated-time">
        {!show ? <Skeleton width="25px" height="9px" /> : details.estimateTime}
      </SelectionListDetails>
      <SelectionListReceiveAmount flex="22%" data-testid="bridge-amount">
        {!show ? <Skeleton width="25px" height="9px" /> : details.receiveAmount}
      </SelectionListReceiveAmount>
    </SelectionListOption>
  )
}

const QuestionHelperWarning = styled(QuestionHelper)`
  width: 12px;
  height: 12px;

  svg {
    stroke: ${({ theme }) => theme.orange1};
  }
`
