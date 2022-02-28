import React, { useMemo } from 'react'
import styled from 'styled-components'
import { formatUnits } from 'ethers/lib/utils'
import { AlertTriangle } from 'react-feather'
import { useDispatch } from 'react-redux'
import { Text } from 'rebass'

import Loader from '../../components/Loader'

import { AsyncState, BridgeList, OptionalBridgeList } from '../../services/Omnibridge/Omnibridge.types'
import { commonActions } from '../../services/Omnibridge/store/Common.reducer'
import { omnibridgeUIActions } from '../../services/Omnibridge/store/UI.reducer'
import {
  useActiveBridge,
  useActiveRoute,
  useAvailableBridges,
  useShowAvailableBridges
} from '../../services/Omnibridge/hooks/Omnibrige.hooks'
import { Route } from '../../services/Omnibridge/Socket/Socket.types'

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
const WrapperStatus = styled.span`
  margin-right: 4px;
`

export const BridgeSelectionWindow = () => {
  const dispatch = useDispatch()

  const activeBridge = useActiveBridge()
  const activeRoute = useActiveRoute()
  const availableBridges = useAvailableBridges()
  const showAvailableBridges = useShowAvailableBridges()

  const handleSelectBridge = (id: OptionalBridgeList) => {
    dispatch(commonActions.setActiveBridge(id))
  }
  const handleSelectRoute = (routeId: string | undefined) => {
    dispatch(commonActions.setActiveRouteId(routeId))
  }
  const handleSelectToAmount = (value: string | undefined) => {
    dispatch(omnibridgeUIActions.setTo({ value }))
  }

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
          {availableBridges?.map(({ bridgeId, name, details, status, receiveAmount }) => {
            return (
              <Bridge
                id={bridgeId}
                key={bridgeId}
                name={name}
                activeBridge={activeBridge}
                details={details}
                status={status}
                receiveAmount={receiveAmount}
                activeRoute={activeRoute}
                handleSelectBridge={handleSelectBridge}
                handleSelectRoute={handleSelectRoute}
                handleSelectToAmount={handleSelectToAmount}
              />
            )
          })}
        </WrapperBridgeSelectionWindow>
      )}
    </>
  )
}

interface BridgeProps {
  id?: BridgeList
  name?: string
  activeBridge: OptionalBridgeList
  details: {
    routes?: {
      tokenDetails: {
        chainId: number
        address: string
        decimals: number
        icon: string
        name: string
        symbol: string
      }
      routes: Route[]
    }
    gas?: string
    fee?: string
    estimateTime?: string
  }

  receiveAmount?: string
  activeRoute?: string
  status: AsyncState
  handleSelectBridge: (id: OptionalBridgeList) => void
  handleSelectRoute: (routeId: string | undefined) => void
  handleSelectToAmount: (value: string | undefined) => void
}

const Bridge = ({
  id,
  name,
  activeBridge,
  details,
  status,
  receiveAmount,
  activeRoute,
  handleSelectBridge,
  handleSelectRoute,
  handleSelectToAmount
}: BridgeProps) => {
  const isSelected = useMemo(() => id === activeBridge, [id, activeBridge])
  const isError = useMemo(() => status === 'failed', [status])
  const isLoading = useMemo(() => status === 'loading', [status])

  const { gas, fee, estimateTime, routes } = details

  return (
    <>
      <BridgeOption
        isSelected={isSelected}
        isError={isError || isLoading}
        onClick={() => {
          if (!isError && !isLoading) {
            handleSelectBridge(id)

            if (routes) {
              handleSelectRoute(routes.routes[0].routeId)
              handleSelectToAmount(routes.routes[0].toAmount)
            } else {
              handleSelectRoute(undefined)
              handleSelectToAmount(receiveAmount)
            }
          }
        }}
      >
        <BridgeName isSelected={isSelected}>
          {isError && (
            <WrapperStatus>
              <AlertTriangle color="#f00" size="16" />
            </WrapperStatus>
          )}
          {isLoading && (
            <WrapperStatus>
              <Loader />
            </WrapperStatus>
          )}
          {name}
        </BridgeName>
        <BridgeDetails>{fee ? fee : ''}</BridgeDetails>
        <BridgeDetails>{gas ? gas : ''}</BridgeDetails>
        <BridgeEstimatedTime>{estimateTime ? estimateTime : ''}</BridgeEstimatedTime>
      </BridgeOption>
      {/* TODO style routes for bridge and display error message */}
      <div>
        {routes &&
          !isLoading &&
          routes.routes.map(({ toAmount, totalGasFeesInUsd, serviceTime, routeId }) => {
            return (
              <div
                onClick={() => {
                  handleSelectRoute(routeId)
                  handleSelectBridge(id)
                  handleSelectToAmount(formatUnits(toAmount, routes.tokenDetails.decimals))
                }}
                style={
                  activeRoute === routeId
                    ? { display: 'flex', fontSize: '12px', marginTop: '10px', background: 'aqua', padding: '8px' }
                    : { display: 'flex', fontSize: '12px', marginTop: '10px', background: '#333', padding: '8px' }
                }
                key={routeId}
              >
                <p>{Number(formatUnits(toAmount, routes.tokenDetails.decimals)).toFixed(0)}</p>
                <p>{(serviceTime / 60).toFixed(0)}</p>
                <p>{totalGasFeesInUsd.toFixed(2)}</p>
              </div>
            )
          })}
      </div>
    </>
  )
}
