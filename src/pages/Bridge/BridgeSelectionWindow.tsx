import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { Text } from 'rebass'
import { BridgeList, OptionalBridgeList } from '../../services/Omnibridge/Omnibridge.types'
import { useOmnibridge } from '../../services/Omnibridge/OmnibridgeProvider'
import { commonActions } from '../../services/Omnibridge/store/Common.reducer'
import { AppState } from '../../state'
// import Loader from '../../components/Loader'
import { OmnibridgeChildBase } from '../../services/Omnibridge/Omnibridge.utils'
import { AlertTriangle } from 'react-feather'
// import { formatUnits } from 'ethers/lib/utils'

const WrapperBridgeSelectionWindow = styled.div`
  width: 100%;
  margin-bottom: 10px;
`
const BridgeWrapperLabel = styled.div`
  margin: 12px 0;
  background: transparent;
  display: grid;
  grid-template-columns: 52% 13% 13% 22%;
`
const BridgeLabel = styled(Text)<{ justify?: boolean }>`
  color: ${({ theme }) => theme.text5}
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  flex: 100%;
  justify-self: ${({ justify }) => (justify ? 'start' : 'end')};
`
const BridgeOption = styled.div<{ isSelected: boolean; isError?: boolean }>`
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
  cursor: ${({ isError }) => (isError ? 'not-allowed' : 'pointer')};
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
`
const BridgeEstimatedTime = styled(BridgeDetails)`
  font-weight: 600;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  justify-self: end;
  padding-right: 10px;
`
const WrapperError = styled.span`
  margin-right: 4px;
`

export const BridgeSelectionWindow = () => {
  const omnibridge = useOmnibridge()
  const dispatch = useDispatch()
  const { from, to, showAvailableBridges } = useSelector((state: AppState) => state.omnibridge.UI)
  const selected = useSelector((state: AppState) => state.omnibridge.common.activeBridge)

  const [availableBridges, setAvailableBridges] = useState<
    {
      id: BridgeList
      name: string
      bridge: OmnibridgeChildBase
    }[]
  >()

  console.warn(setAvailableBridges)
  const handleSelect = (id: OptionalBridgeList) => {
    dispatch(commonActions.setActiveBridge(id))
  }

  useEffect(() => {
    if (!from.chainId || !to.chainId) return
    if (showAvailableBridges) {
      // setAvailableBridges(omnibridge.getSupportedBridges(from.chainId, to.chainId))
    }
  }, [from.chainId, to.chainId, omnibridge, from.address, to.address, from.value, dispatch, showAvailableBridges])

  return (
    <>
      {showAvailableBridges && (
        <WrapperBridgeSelectionWindow>
          <BridgeWrapperLabel>
            <BridgeLabel justify={true}>Bridge</BridgeLabel>
            <BridgeLabel>Fee</BridgeLabel>
            <BridgeLabel>Gas</BridgeLabel>
            <BridgeLabel>Time</BridgeLabel>
          </BridgeWrapperLabel>
          {availableBridges?.map(({ id, name }) => {
            return <Bridge id={id} key={id} name={name} selected={selected} handleSelect={handleSelect} />
          })}
        </WrapperBridgeSelectionWindow>
      )}
    </>
  )
}

interface BridgeProps {
  id: BridgeList
  name: string
  selected: OptionalBridgeList
  handleSelect: (id: OptionalBridgeList) => void
}

const Bridge = ({ id, name, selected, handleSelect }: BridgeProps) => {
  // const { from, to } = useSelector((state: AppState) => state.omnibridge.UI)
  // const omnibridge = useOmnibridge()

  // const [loading, setLoading] = useState(false)
  // const [metaData, setMetaData] = useState<
  //   | {
  //       name: string
  //       bridgeId: OptionalBridgeList
  //       errors: {
  //         message: string
  //       }
  //       routes?: [
  //         {
  //           chainGasBalances: {
  //             [n: number]: {
  //               hasGasBalance: false
  //               minGasBalance: string
  //             }
  //           }
  //           fromAmount: string
  //           routeId: string
  //           sender: string
  //           serviceTime: number
  //           toAmount: string
  //           totalGasFeesInUsd: number
  //           totalUserTx: number
  //           usedBridgeNames: string[]
  //           userTxs: any
  //         }
  //       ]
  //       gas?: string
  //       fee?: string
  //       estimatedTime?: number | string
  //     }
  //   | undefined
  // >()

  // const isSelected = selected === id
  // const isError = metaData && metaData.errors.message.length > 0

  // useEffect(() => {
  //   setMetaData(undefined)

  //   const getMetaDataBridge = async () => {
  //     setLoading(true)
  //     const response = await omnibridge.bridges[id].getBridgingMetadata()
  //     setMetaData(response)
  //     setLoading(false)
  //   }
  //   getMetaDataBridge()
  // }, [id, omnibridge.bridges, from.chainId, from.value, from.address, to.address, to.chainId])

  const isSelected = false
  const isError = false
  const loading = false
  return (
    <>
      <BridgeOption
        isSelected={isSelected}
        isError={isError || loading}
        onClick={() => {
          if (!isError && !loading) {
            handleSelect(id)
          }
        }}
      >
        <BridgeName isSelected={isSelected}>
          {isError && (
            <WrapperError>
              <AlertTriangle color="#f00" size="16" />
            </WrapperError>
          )}
          {name}
        </BridgeName>
        <BridgeDetails></BridgeDetails>
        <BridgeDetails></BridgeDetails>
        <BridgeEstimatedTime></BridgeEstimatedTime>
      </BridgeOption>

      {/* <div>
        {metaData?.routes &&
          metaData.routes.map(({ toAmount, totalGasFeesInUsd, serviceTime, routeId }) => {
            return (
              <div style={{ background: 'red' }} key={routeId}>
                <p>{formatUnits(toAmount, 6)}</p>
                <p>{(serviceTime / 60).toFixed(0)}</p>
                <p>{totalGasFeesInUsd.toFixed(2)}</p>
              </div>
            )
          })}
      </div> */}
    </>
  )
}
