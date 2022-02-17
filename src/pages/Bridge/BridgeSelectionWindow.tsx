import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { BridgeList } from '../../services/Omnibridge/Omnibridge.types'
import { OmnibridgeChildBase } from '../../services/Omnibridge/Omnibridge.utils'
import { useOmnibridge } from '../../services/Omnibridge/OmnibridgeProvider'
import { omnibridgeUIActions } from '../../services/Omnibridge/store/Omnibridge.reducer'
import { AppState } from '../../state'
import { BridgeModalStatus } from '../../state/bridge/reducer'

const WrapperBridgeSelectionWindow = styled.div<{ show: boolean }>`
  width: 100%;
  margin-bottom: 10px;
  display: ${({ show }) => (show ? 'block' : 'none')};
  z-index: ${({ show }) => (show ? '1' : '-1')};
`
const BridgeWrapperLabel = styled.div`
  margin: 12px 0;
  background: transparent;
  display: grid;
  grid-template-columns: 52% 13% 13% 22%;
`
const BridgeLabel = styled.span<{ justify?: boolean }>`
  color: ${({ theme }) => theme.text5}
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  flex: 100%;
  justify-self: ${({ justify }) => (justify ? 'start' : 'end')};
`
const BridgeOption = styled.div<{ isSelected: boolean }>`
  background: ${({ isSelected }) => (isSelected ? 'rgba(104,110,148,.2)' : 'rgba(104,110,148,.1)')};
  width: 100%;
  border-radius: 8px;
  padding: 8px 0px;
  border: ${({ isSelected }) => (isSelected ? '1px solid rgba(120, 115, 164, 0.6)' : 'none')};
  margin-top: 8px;
  cursor: pointer;
  display: grid;
  grid-template-columns: 52% 13% 13% 22%;
  align-items: center;
  transition: background 0.4s ease;
`
const BridgeName = styled.div<{ isSelected: boolean }>`
  margin: 0;
  font-weight: ${({ isSelected }) => (isSelected ? '600' : '500')};
  font-size: 14px;
  color: ${({ isSelected, theme }) => (isSelected ? theme.text1 : theme.text3)};
  padding-left: 10px;
`
const BridgeDetails = styled.span`
  font-weight: 500;
  font-size: 10px;
  color: ${({ theme }) => theme.text5};
  text-transform: uppercase;
  justify-self: end;
`
const BridgeEstimatedTime = styled(BridgeDetails)`
  font-weight: 600;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  justify-self: end;
  padding-right: 10px;
`

export const BridgeSelectionWindow = () => {
  const omnibridge = useOmnibridge()
  const { from, to, modal } = useSelector((state: AppState) => state.omnibridge.UI)
  const dispatch = useDispatch()

  const [isShow, setIsShow] = useState(false)
  const [selected, setSelected] = useState('')
  const [availableBridges, setAvailableBridges] = useState<
    { id: BridgeList; bridge: OmnibridgeChildBase; name: string }[]
  >()

  const handleSelect = (id: string) => {
    setSelected(id)
    dispatch(omnibridgeUIActions.setSelectedActiveBridge(id))
  }

  useEffect(() => {
    if (!from.chainId || !to.chainId || !from.address || !to.address) return
    setAvailableBridges(omnibridge.getSupportedBridges(from.chainId, to.chainId))
    console.log(from)
    if (Number(from.value) === 0 || modal.status === BridgeModalStatus.ERROR) {
      setIsShow(false)
      dispatch(omnibridgeUIActions.setSelectedActiveBridge(''))
      setSelected('')
      return
    }

    if (from.address) {
      setIsShow(true)
      return
    }
  }, [from.chainId, to.chainId, omnibridge, from.address, to.address, from.value, dispatch, modal.status])

  return (
    <WrapperBridgeSelectionWindow show={isShow}>
      <BridgeWrapperLabel>
        <BridgeLabel justify={true}>Bridge</BridgeLabel>
        <BridgeLabel>Fee</BridgeLabel>
        <BridgeLabel>Gas</BridgeLabel>
        <BridgeLabel>Time</BridgeLabel>
      </BridgeWrapperLabel>
      {availableBridges?.map(({ id, name }) => (
        <Bridge id={id} key={id} name={name} selected={selected} handleSelect={handleSelect} />
      ))}
    </WrapperBridgeSelectionWindow>
  )
}

interface BridgeProps {
  id: string
  name: string
  selected: string
  handleSelect: (id: string) => void
}

const Bridge = ({ id, name, selected, handleSelect }: BridgeProps) => {
  const isSelected = selected === id

  return (
    <>
      <BridgeOption isSelected={isSelected} onClick={() => handleSelect(id)}>
        <BridgeName isSelected={isSelected}>{name}</BridgeName>
        <BridgeDetails>0.1%</BridgeDetails>
        <BridgeDetails>10$</BridgeDetails>
        <BridgeEstimatedTime>7 days</BridgeEstimatedTime>
      </BridgeOption>
    </>
  )
}
