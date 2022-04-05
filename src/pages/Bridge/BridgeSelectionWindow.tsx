import React, { useMemo } from 'react'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import { Text, Box } from 'rebass'
import { AsyncState, BridgeList, OptionalBridgeList } from '../../services/EcoBridge/EcoBridge.types'
import { commonActions } from '../../services/EcoBridge/store/Common.reducer'
import { useActiveBridge, useAvailableBridges, useShowAvailableBridges } from '../../services/EcoBridge/EcoBridge.hooks'
import Skeleton from 'react-loading-skeleton'
import QuestionHelper from '../../components/QuestionHelper'
import {
  SelectionListWindowWrapper,
  SelectionListLabelWrapper,
  SelectionListLabel,
  SelectionListOption,
  SelectionListName,
  SelectionListDetails,
  SelectionListReceiveAmount
} from '../../components/SelectionList'

export const BridgeSelectionWindow = () => {
  const dispatch = useDispatch()
  const activeBridge = useActiveBridge()
  const availableBridges = useAvailableBridges()
  const showAvailableBridges = useShowAvailableBridges()

  const handleSelectBridge = (id: OptionalBridgeList) => {
    dispatch(commonActions.setActiveBridge(id))
  }

  return (
    <>
      {showAvailableBridges && availableBridges.length > 0 && (
        <SelectionListWindowWrapper>
          <SelectionListLabelWrapper>
            <SelectionListLabel flex="30%" justify={true}>
              Bridge
            </SelectionListLabel>
            <SelectionListLabel>Fee</SelectionListLabel>
            <SelectionListLabel>Gas</SelectionListLabel>
            <SelectionListLabel>Time</SelectionListLabel>
            <SelectionListLabel flex="27%">Amount</SelectionListLabel>
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

      {showAvailableBridges && availableBridges.length === 0 && (
        <Box sx={{ marginTop: '15px', width: '100%' }}>
          <Text sx={{ textAlign: 'center', color: '#464366' }}>No available bridges</Text>
        </Box>
      )}
    </>
  )
}

interface BridgeProps {
  id?: BridgeList
  name?: string
  activeBridge: OptionalBridgeList
  details: {
    gas?: string
    fee?: string
    estimateTime?: string
    receiveAmount?: string
  }
  status: AsyncState
  handleSelectBridge: (id: OptionalBridgeList) => void
}

const Bridge = ({ id, name, activeBridge, details, status, handleSelectBridge }: BridgeProps) => {
  const isSelected = useMemo(() => id === activeBridge, [id, activeBridge])
  const isLoading = useMemo(() => status === 'loading', [status])

  const show = status !== 'loading' && details

  return (
    <SelectionListOption
      isSelected={isSelected}
      isLoading={isLoading}
      onClick={() => {
        if (!isLoading) {
          handleSelectBridge(id)
        }
      }}
    >
      <SelectionListName flex="30%" isSelected={isSelected}>
        {name}
      </SelectionListName>
      <SelectionListDetails>
        {!show ? (
          <Skeleton width="25px" height="9px" />
        ) : !details.fee ? (
          <QuestionHelperWarning text={'Cannot estimate fee'} />
        ) : (
          details.fee
        )}
      </SelectionListDetails>
      <SelectionListDetails>
        {!show ? (
          <Skeleton width="25px" height="9px" />
        ) : !details.gas ? (
          <QuestionHelperWarning text={'Cannot estimate gas'} />
        ) : (
          details.gas
        )}
      </SelectionListDetails>
      <SelectionListDetails>
        {!show ? <Skeleton width="25px" height="9px" /> : details.estimateTime}
      </SelectionListDetails>
      <SelectionListReceiveAmount flex="27%">
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
