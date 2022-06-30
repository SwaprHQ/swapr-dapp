import { formatUnits } from '@ethersproject/units'
import { ChainId, Currency } from '@swapr/sdk'

import { utils } from 'ethers'

import { DAI, ZERO_ADDRESS } from '../../../constants'
import { BridgeTransactionStatus } from '../../../state/bridgeTransactions/types'
import { XdaiBridgeExecutions, XdaiBridgeRequests, XdaiBridgeTransaction } from './XdaiBridge.types'

export const ETHEREUM_BRIDGE_ADDRESS = '0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016'
export const XDAI_BRIDGE_ADDRESS = '0x7301CFA0e1756B71869E93d4e4Dca5c7d0eb0AA6'

export const XDAI_BRIDGE_FOREIGN_SUBGRAPH_ENDPOINT =
  'https://api.thegraph.com/subgraphs/name/maxaleks/foreign-bridge-mainnet'
export const XDAI_BRIDGE_HOME_SUBGRAPH_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/maxaleks/home-bridge-xdai'

export const packSignatures = (array: { r: string; s: string; v: string }[]) => {
  const length = utils.hexValue(array.length).replace(/^0x/, '')
  const msgLength = length.length === 1 ? `0${length}` : length

  let v = ''
  let r = ''
  let s = ''

  array.forEach(e => {
    v = v.concat(e.v)
    r = r.concat(e.r)
    s = s.concat(e.s)
  })

  return `0x${msgLength}${v}${r}${s}`
}

export const signatureToVRS = (rawSignature: string) => {
  const signature = rawSignature.replace(/^0x/, '')
  const v = signature.substr(64 * 2)
  const r = signature.substr(0, 32 * 2)
  const s = signature.substr(32 * 2, 32 * 2)
  return { v, r, s }
}

export const combineTransactions = (
  requests: XdaiBridgeRequests,
  executions: XdaiBridgeExecutions,
  chainId: ChainId,
  bridgeChainId: ChainId
): XdaiBridgeTransaction[] =>
  requests.requests.map(request => {
    const execution = executions.executions.find(
      exec => exec.transactionHash.toLowerCase() === request.transactionHash.toLowerCase()
    )

    const { sender, transactionHash, value, message } = request

    const token = { symbol: '', assetAddressL1: '', assetAddressL2: '' }

    if (chainId === ChainId.MAINNET) {
      token.symbol = DAI[ChainId.MAINNET].symbol ?? 'DAI'
      token.assetAddressL1 = DAI[ChainId.MAINNET].address
      token.assetAddressL2 = ZERO_ADDRESS
    } else {
      token.symbol = Currency.getNative(ChainId.XDAI).symbol ?? 'XDAI'
      token.assetAddressL1 = ZERO_ADDRESS
      token.assetAddressL2 = DAI[ChainId.MAINNET].address
    }

    let status = BridgeTransactionStatus.PENDING

    if (chainId === ChainId.XDAI && message && message.content && message.id && !!message.signatures?.length)
      status = BridgeTransactionStatus.REDEEM

    if (execution) {
      if (bridgeChainId === ChainId.MAINNET) {
        status = BridgeTransactionStatus.CLAIMED
      } else {
        status = BridgeTransactionStatus.CONFIRMED
      }
    }

    return {
      txHash: transactionHash,
      partnerTransactionHash: execution?.id,
      assetName: token.symbol,
      assetAddressL1: token.assetAddressL1,
      assetAddressL2: token.assetAddressL2,
      value: formatUnits(value, 18), //dai and xdai have 18 decimals
      fromChainId: chainId,
      toChainId: bridgeChainId,
      sender,
      timestampResolved: Number(execution?.timestamp) * 1000,
      message,
      status,
      needsClaiming: chainId !== ChainId.MAINNET,
    }
  })
