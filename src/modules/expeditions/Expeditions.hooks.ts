import { JsonRpcProvider } from '@ethersproject/providers'
import { ChainId, Trade } from '@swapr/sdk'

import { Contract } from 'ethers'
import { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { EXPEDITIONS_NFT_CONTRACTS, NETWORK_DETAIL } from '../../constants'
import SwaprExpeditionsNFTAbi from '../../constants/abis/SwaprExpeditionsNFT.json'
import { useActiveWeb3React } from '../../hooks'
import { useNetworkSwitch } from '../../hooks/useNetworkSwitch'
import { addInfuraKey } from '../../services/EcoBridge/EcoBridge.providers'
import { AppState } from '../../state'
import { useTransactionAdder } from '../../state/transactions/hooks'
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
  const fetchRewards = useExpeditionsFetchRewards()
  const refeshCampaignProgress = useCallback(
    async (address: string, updateStatus = true) => {
      updateStatus && dispatch(expeditionsActions.statusUpdated({ status: 'pending', error: undefined }))

      try {
        const progressResponse = await ExpeditionsAPI.getExpeditionsProgress({ address })
        const rewardsStatus = await fetchRewards()
        dispatch(expeditionsActions.expeditionsProgressUpdated({ ...progressResponse, rewardsStatus }))
      } catch (error) {
        updateStatus &&
          dispatch(expeditionsActions.statusUpdated({ status: 'error', error: 'No active campaign has been found' }))
        console.error(error)
      }
    },
    [dispatch, fetchRewards]
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

export const useExpeditionsFetchRewards = () => {
  const { account } = useActiveWeb3React()
  const goerliProvider = useMemo(() => new JsonRpcProvider(addInfuraKey(NETWORK_DETAIL[ChainId.GOERLI].rpcUrls[0])), [])
  const nftContract = useMemo(
    () => new Contract(EXPEDITIONS_NFT_CONTRACTS[ChainId.GOERLI], SwaprExpeditionsNFTAbi, goerliProvider),
    [goerliProvider]
  )

  const fetchRewards = useCallback(async () => {
    const ownedRewards = await nftContract.getRewardsStatus(account)
    return ownedRewards as boolean[]
  }, [account, nftContract])

  return fetchRewards
}

export const useExpeditionsRewardClaim = () => {
  const { library, account, chainId } = useActiveWeb3React()
  const { selectNetwork } = useNetworkSwitch()
  const [claimedTokenId, setClaimedTokenId] = useState<string | undefined>(undefined)
  const addTransaction = useTransactionAdder()
  const refreshProgress = useExpeditionsRefreshProgress()
  const needsToChangeNetwork = chainId !== 5

  const getClaimSignature = useCallback(
    async (tokenId: string) => {
      if (!library) {
        throw new Error('Provider not found')
      }

      const address = await library.getSigner().getAddress()
      const signature = await library.getSigner().signMessage(tokenId)

      const claimSignature = await ExpeditionsAPI.postExpeditionsClaimreward({
        body: {
          address,
          signature,
          tokenId,
        },
      })
      return claimSignature
    },
    [library]
  )

  const claimRewardOnChain = useCallback(
    async (tokenId: string, claimSignature: string) => {
      if (!library || !chainId) {
        throw new Error('Not connected with web3 provider')
      }

      const nftContract = new Contract(
        EXPEDITIONS_NFT_CONTRACTS[ChainId.GOERLI],
        SwaprExpeditionsNFTAbi,
        library.getSigner()
      )
      const transaction = await nftContract.claimReward(tokenId, claimSignature)
      addTransaction(transaction, {
        summary: 'Collect Expeditions Reward',
      })
      await transaction.wait()
    },
    [addTransaction, chainId, library]
  )

  const changeNetwork = useCallback(async () => {
    if (needsToChangeNetwork) {
      await selectNetwork(5)
    }
  }, [needsToChangeNetwork, selectNetwork])

  const claimReward = useCallback(
    async (tokenId: string) => {
      try {
        setClaimedTokenId(tokenId)
        const { claimSignature } = await getClaimSignature(tokenId)
        await claimRewardOnChain(tokenId, claimSignature)
      } finally {
        refreshProgress(account || '', false)
        setClaimedTokenId(undefined)
      }
    },
    [account, claimRewardOnChain, getClaimSignature, refreshProgress]
  )

  return {
    changeNetwork,
    claimReward,
    claimedTokenId,
    needsToChangeNetwork,
  }
}
