import { Trade } from '@swapr/sdk'

import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useActiveWeb3React } from '../../hooks'
import { AppState } from '../../state'
import { getTradeUSDValue } from '../../utils/coingecko'
import { ExpeditionsAPI } from './api'
import { ClaimTaskRequestTypeEnum } from './api/generated'
import { expeditionsActions } from './Expeditions.reducer'

export const useExpeditions = () => {
  const expeditionsState = useSelector((state: AppState) => state.expeditions)

  return expeditionsState
}

export const useExpeditionsRefreshProgress = () => {
  const dispatch = useDispatch()

  const refeshCampaignProgress = useCallback(
    async (address: string, updateStatus = true) => {
      updateStatus && dispatch(expeditionsActions.statusUpdated({ status: 'pending', error: undefined }))

      try {
        const progressResponse = await ExpeditionsAPI.getExpeditionsProgress({ address })
        dispatch(expeditionsActions.expeditionsProgressUpdated(progressResponse))
      } catch (error) {
        updateStatus &&
          dispatch(expeditionsActions.statusUpdated({ status: 'error', error: 'No active campaign has been found' }))
        console.error(error)
      }
    },
    [dispatch]
  )

  return refeshCampaignProgress
}

export const useExpeditionsTaskClaim = () => {
  const { library } = useActiveWeb3React()
  const refreshExpeditions = useExpeditionsRefreshProgress()
  const [isClaiming, setIsClaiming] = useState(false)

  const claimTask = useCallback(
    async (taskType: ClaimTaskRequestTypeEnum) => {
      if (!library) {
        throw new Error('Provider not found')
      }

      setIsClaiming(true)

      try {
        const address = await library.getSigner().getAddress()
        const signature = await library.getSigner().signMessage(taskType)

        await ExpeditionsAPI.postExpeditionsClaimtask({
          body: {
            address,
            signature,
            type: taskType,
          },
        })

        await refreshExpeditions(address, false)
      } catch (error) {
        console.error(error)
      } finally {
        setIsClaiming(false)
      }
    },
    [library, refreshExpeditions]
  )

  return {
    claimTask,
    isClaiming,
  }
}

export const useExpeditionsRegisterDailySwap = () => {
  const { account } = useActiveWeb3React()
  const dailySwapsTracked = useSelector((state: AppState) => state.expeditions.dailySwapsTracked)
  const refreshExpeditions = useExpeditionsRefreshProgress()

  const registerDailySwap = useCallback(
    async (trade: Trade) => {
      if (!dailySwapsTracked) return
      if (!account) {
        throw new Error('Cannot register daily swap: no account has been found')
      }
      const tradeUSDValue = await getTradeUSDValue(trade)

      try {
        await ExpeditionsAPI.postExpeditionsRegisterdailyswap({
          body: {
            address: account,
            tradeUSDValue: Number(tradeUSDValue),
          },
        })

        await refreshExpeditions(account, false)
      } catch (error) {
        console.error(error)
      }
    },
    [account, dailySwapsTracked, refreshExpeditions]
  )

  return registerDailySwap
}
