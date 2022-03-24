import React, { useMemo } from 'react'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import { Text, Box } from 'rebass'
import { AsyncState, BridgeList, OptionalBridgeList } from '../../services/Omnibridge/Omnibridge.types'
import { commonActions } from '../../services/Omnibridge/store/Common.reducer'
import {
  useActiveBridge,
  useAvailableBridges,
  useShowAvailableBridges
} from '../../services/Omnibridge/hooks/Omnibrige.hooks'
import Skeleton from 'react-loading-skeleton'
import QuestionHelper from '../../components/QuestionHelper'

const WrapperBridgeSelectionWindow = styled.div`
  width: 100%;
`
const BridgeWrapperLabel = styled.div`
  margin: 12px 0;
  background: transparent;
  display: grid;
  grid-template-columns: repeat(5, 20%);
`
const BridgeLabel = styled(Text)<{ justify?: boolean }>`
  color: ${({ theme }) => theme.text5}
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  flex: 100%;
  justify-self: ${({ justify }) => (justify ? 'start' : 'end')};
`
const BridgeOption = styled.div<{ isSelected: boolean; isLoading: boolean }>`
  background: ${({ isSelected }) => (isSelected ? 'rgba(104,110,148,.2)' : 'rgba(104,110,148,.1)')};
  width: 100%;
  border-radius: 8px;
  padding: 8px 0px;
  border: ${({ isSelected }) => (isSelected ? '1px solid rgba(120, 115, 164, 0.6)' : 'none')};
  margin-top: 8px;
  cursor: pointer;
  display: grid;
  grid-template-columns: repeat(5, 20%);
  align-items: center;
  transition: background 0.4s ease;
  cursor: ${({ isLoading }) => (isLoading ? 'not-allowed' : 'pointer')};
`
const BridgeName = styled(Text)<{ isSelected: boolean }>`
  margin: 0;
  font-weight: ${({ isSelected }) => (isSelected ? '600' : '500')};
  font-size: 14px;
  color: ${({ isSelected, theme }) => (isSelected ? theme.text1 : theme.text3)};
  padding-left: 10px;
`
const BridgeDetails = styled(Text)`
  font-weight: 500;
  font-size: 10px;
  color: ${({ theme }) => theme.text5};
  text-transform: uppercase;
  justify-self: end;
  min-width: 100%;
`
const BridgeReceiveAmount = styled(BridgeDetails)`
  font-weight: 600;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  justify-self: end;
  padding-right: 10px;
`

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
        <WrapperBridgeSelectionWindow>
          <BridgeWrapperLabel>
            <BridgeLabel justify={true}>Bridge</BridgeLabel>
            <BridgeLabel>Fee</BridgeLabel>
            <BridgeLabel>Gas</BridgeLabel>
            <BridgeLabel>Time</BridgeLabel>
            <BridgeLabel>Amount</BridgeLabel>
          </BridgeWrapperLabel>
          {availableBridges.map(({ bridgeId, name, details, status }) => {
            return (
              <Bridge
                id={bridgeId}
                key={bridgeId}
                name={name}
                activeBridge={activeBridge}
                details={details}
                status={status}
                handleSelectBridge={handleSelectBridge}
              />
            )
          })}
        </WrapperBridgeSelectionWindow>
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
    <BridgeOption
      isSelected={isSelected}
      isLoading={isLoading}
      onClick={() => {
        if (!isLoading) {
          handleSelectBridge(id)
        }
      }}
    >
      <BridgeName isSelected={isSelected}>{name}</BridgeName>
      <BridgeDetails>
        {!show ? (
          <Skeleton width="25px" height="9px" />
        ) : details.fee === 'error' ? (
          <QuestionHelperWarning text={'Cannot estimate fee'} />
        ) : (
          details.fee
        )}
      </BridgeDetails>
      <BridgeDetails>
        {!show ? (
          <Skeleton width="25px" height="9px" />
        ) : details.gas === 'error' ? (
          <QuestionHelperWarning text={'Cannot estimate gas'} />
        ) : (
          details.gas
        )}
      </BridgeDetails>
      <BridgeDetails>{!show ? <Skeleton width="25px" height="9px" /> : details.estimateTime}</BridgeDetails>
      <BridgeReceiveAmount>
        {!show ? <Skeleton width="25px" height="9px" /> : details.receiveAmount}
      </BridgeReceiveAmount>
    </BridgeOption>
  )
}

const QuestionHelperWarning = styled(QuestionHelper)`
  width: 12px;
  height: 12px;

  svg {
    stroke: ${({ theme }) => theme.orange1};
  }
`
