import { Provider, TransactionReceipt } from '@ethersproject/abstract-provider'
import { ChainId } from '@swapr/sdk'

import { BigNumber, Contract, ContractTransaction, Signer, utils } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { gql } from 'graphql-request'

import { WETH_GNOSIS_ADDRESS, ZERO_ADDRESS } from '../../../constants'
import { BridgeTransactionStatus } from '../../../state/bridgeTransactions/types'
import { EcoBridgeProviders } from '../EcoBridge.types'
import { BRIDGE_CONFIG, OVERRIDES } from './OmniBridge.config'
import {
  ConfigPerChain,
  Mode,
  OmnibridgeExecution,
  OmnibridgeRequest,
  OmnibridgeToken,
  OmnibridgeTokenWithAddressAndChain,
} from './OmniBridge.types'

//constants
export const defaultTokensUrl: ConfigPerChain = {
  100: 'https://tokens.honeyswap.org',
  1: 'https://tokens.uniswap.org',
}

export const nativeCurrencyMediators: ConfigPerChain = {
  1: '0xa6439ca0fcba1d0f80df0be6a17220fed9c9038a'.toLowerCase(),
}

export const VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
}

//subgraph
export const getGraphEndpoint = (chainId: ChainId, direction: string) => {
  const name =
    chainId === BRIDGE_CONFIG[direction].homeChainId
      ? BRIDGE_CONFIG[direction].homeGraphName
      : BRIDGE_CONFIG[direction].foreignGraphName

  return `https://api.thegraph.com/subgraphs/name/${name}`
}

export const QUERY_ETH_PRICE = gql`
  query {
    bundle(id: "1") {
      nativeCurrencyPrice
    }
  }
`

//error message
export const getErrorMsg = (error: any) => {
  if (error?.code === 4001) {
    return 'Transaction rejected'
  }
  return `Bridge failed: ${error.message}`
}

//overrides
const isOverridden = (bridgeDirection: string, token: OmnibridgeTokenWithAddressAndChain) => {
  if (!token || !bridgeDirection) return false

  const { address, chainId } = token

  if (!address || !chainId) return false

  const overrides = OVERRIDES[bridgeDirection]
  const override = overrides[token.address.toLowerCase()]

  return override !== undefined && override[chainId] !== undefined
}

const getOverriddenMode = (bridgeDirection: string, token: OmnibridgeTokenWithAddressAndChain) => {
  if (!token || !bridgeDirection) return

  const { address, chainId } = token

  const overrides = OVERRIDES[bridgeDirection]

  return overrides[address.toLowerCase()][chainId].mode as Mode
}

const getOverriddenMediator = (bridgeDirection: string, token: OmnibridgeTokenWithAddressAndChain) => {
  if (!token || !bridgeDirection) return

  const { address, chainId } = token

  const overrides = OVERRIDES[bridgeDirection]

  return overrides[address.toLowerCase()][chainId].mediator.toLowerCase()
}

const getMediatorAddressWithoutOverride = (bridgeDirection: string, chainId: ChainId) => {
  if (!bridgeDirection || !chainId) return

  const { homeChainId, homeMediatorAddress, foreignMediatorAddress } = BRIDGE_CONFIG[bridgeDirection]

  return homeChainId === chainId ? homeMediatorAddress.toLowerCase() : foreignMediatorAddress.toLowerCase()
}

export const getOverriddenToToken = (bridgeDirection: string, token: OmnibridgeTokenWithAddressAndChain) => {
  if (!token || !bridgeDirection) return

  const { address, chainId } = token

  const overrides = OVERRIDES[bridgeDirection]

  return overrides[address.toLowerCase()][chainId].to
}

//get mode
export const fetchMode = async (
  bridgeDirection: string,
  token: OmnibridgeTokenWithAddressAndChain,
  provider?: Provider
) => {
  if (!provider) return

  if (isOverridden(bridgeDirection, token)) {
    return getOverriddenMode(bridgeDirection, token)
  }
  const { enableReversedBridge, homeChainId } = BRIDGE_CONFIG[bridgeDirection]

  if (!enableReversedBridge) {
    return token.chainId === homeChainId ? Mode.ERC677 : Mode.ERC20
  }

  const { chainId, address } = token
  const mediatorAddress = getMediatorAddressWithoutOverride(bridgeDirection, chainId)

  const abi = ['function nativeTokenAddress(address) view returns (address)']

  if (!mediatorAddress) return

  const mediatorContract = new Contract(mediatorAddress, abi, provider)
  const nativeTokenAddress = await mediatorContract.nativeTokenAddress(address)

  if (nativeTokenAddress === ZERO_ADDRESS) return Mode.ERC20

  return Mode.ERC677
}

//get name
export const fetchTokenName = async (
  token: OmnibridgeTokenWithAddressAndChain & { name: string },
  provider?: Provider
) => {
  let tokenName = token.name || ''

  try {
    const stringAbi = ['function name() view returns (string)']
    const tokenContractString = new Contract(token.address, stringAbi, provider)
    tokenName = await tokenContractString.name()
  } catch {
    const bytes32Abi = ['function name() view returns (bytes32)']
    const tokenContractBytes32 = new Contract(token.address, bytes32Abi, provider)
    tokenName = utils.parseBytes32String(await tokenContractBytes32.name())
  }
  return tokenName
}

const getToName = async (
  fromToken: OmnibridgeTokenWithAddressAndChain & { name: string },
  toChainId: ChainId,
  toAddress: string,
  provider?: Provider
) => {
  const { name: fromTokenName } = fromToken

  if (toAddress === ZERO_ADDRESS) {
    return fromTokenName || (await fetchTokenName(fromToken))
  }

  return fetchTokenName({ chainId: toChainId, address: toAddress, name: fromTokenName }, provider)
}

//get mediator
export const getMediatorAddress = (bridgeDirection: string, token: OmnibridgeTokenWithAddressAndChain) => {
  if (!token || !token.chainId || !token.address) return

  if (isOverridden(bridgeDirection, token)) {
    return getOverriddenMediator(bridgeDirection, token)
  }

  return getMediatorAddressWithoutOverride(bridgeDirection, token.chainId)
}

//fetch toToken details
const fetchTokenDetailsString = async (token: OmnibridgeTokenWithAddressAndChain, provider?: Provider) => {
  const abi = [
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
  ]
  const tokenContract = new Contract(token.address, abi, provider)

  const [name, symbol, decimals] = await Promise.all([
    tokenContract.name() as string,
    tokenContract.symbol() as string,
    tokenContract.decimals() as number,
  ])

  return { name, symbol, decimals }
}

const fetchTokenDetailsBytes32 = async (token: OmnibridgeTokenWithAddressAndChain, provider?: Provider) => {
  const abi = [
    'function decimals() view returns (uint8)',
    'function symbol() view returns (bytes32)',
    'function name() view returns (bytes32)',
  ]

  const tokenContract = new Contract(token.address, abi, provider)

  const [name, symbol, decimals] = await Promise.all([
    tokenContract.name() as string,
    tokenContract.symbol() as string,
    tokenContract.decimals() as number,
  ])

  return {
    name: utils.parseBytes32String(name),
    symbol: utils.parseBytes32String(symbol),
    decimals,
  }
}

const fetchTokenDetailsFromContract = async (
  token: OmnibridgeTokenWithAddressAndChain,
  provider?: Provider
): Promise<{ name: string; symbol: string; decimals: number }> => {
  let details = { name: '', symbol: '', decimals: 0 }
  try {
    details = await fetchTokenDetailsString(token, provider)
  } catch {
    details = await fetchTokenDetailsBytes32(token, provider)
  }
  return details
}

export const fetchTokenDetails = async (
  bridgeDirection: string,
  token: OmnibridgeTokenWithAddressAndChain,
  provider?: Provider
) => {
  const mediatorAddress = getMediatorAddress(bridgeDirection, token)

  const [{ name, decimals, symbol }, mode] = await Promise.all([
    fetchTokenDetailsFromContract(token, provider),
    fetchMode(bridgeDirection, token, provider),
  ])

  return {
    ...token,
    name,
    symbol,
    decimals: Number(decimals),
    mode,
    mediator: mediatorAddress,
  }
}

const fetchToTokenDetails = async (
  bridgeDirection: string,
  fromToken: OmnibridgeTokenWithAddressAndChain & { mode: Mode; name: string },
  toChainId: ChainId,
  providers?: EcoBridgeProviders
) => {
  if (!providers) return

  const { address: fromTokenAddress, chainId: fromChainId, mode: fromTokenMode } = fromToken

  if (isOverridden(bridgeDirection, { address: fromTokenAddress, chainId: fromChainId })) {
    const overriddenToTokenAddress = getOverriddenToToken(bridgeDirection, {
      address: fromTokenAddress,
      chainId: fromChainId,
    })

    if (!overriddenToTokenAddress) return

    return fetchTokenDetails(
      bridgeDirection,
      { address: overriddenToTokenAddress, chainId: toChainId },
      providers[toChainId]
    )
  }

  const fromMediatorAddress = getMediatorAddressWithoutOverride(bridgeDirection, fromChainId)
  const toMediatorAddress = getMediatorAddressWithoutOverride(bridgeDirection, toChainId)

  const fromEthersProvider = providers[fromChainId]
  const toEthersProvider = providers[toChainId]

  if (fromTokenAddress === ZERO_ADDRESS && fromTokenMode === Mode.NATIVE) {
    const toAddress = WETH_GNOSIS_ADDRESS
    return fetchTokenDetails(
      bridgeDirection,
      {
        address: toAddress,
        chainId: toChainId,
      },
      toEthersProvider
    )
  }

  if (!fromMediatorAddress || !toMediatorAddress) return

  const abi = [
    'function isRegisteredAsNativeToken(address) view returns (bool)',
    'function bridgedTokenAddress(address) view returns (address)',
    'function nativeTokenAddress(address) view returns (address)',
  ]
  const fromMediatorContract = new Contract(fromMediatorAddress, abi, fromEthersProvider)
  const isNativeToken = await fromMediatorContract.isRegisteredAsNativeToken(fromTokenAddress)

  if (isNativeToken) {
    const toMediatorContract = new Contract(toMediatorAddress, abi, toEthersProvider)

    const toAddress = await toMediatorContract.bridgedTokenAddress(fromTokenAddress)

    const toName = await getToName(fromToken, toChainId, toAddress, toEthersProvider)

    const abiDecimals = ['function decimals() view returns(uint)']
    const decimals = await new Contract(toAddress, abiDecimals, toEthersProvider).decimals()

    return {
      name: toName,
      chainId: toChainId,
      address: toAddress,
      mode: Mode.ERC677,
      mediator: toMediatorAddress,
      decimals: decimals.toString(),
    }
  }

  const toAddress = await fromMediatorContract.nativeTokenAddress(fromTokenAddress)

  const toName = await getToName(fromToken, toChainId, toAddress, toEthersProvider)

  const abiDecimals = ['function decimals() view returns(uint)']
  const decimals = await new Contract(toAddress, abiDecimals, toEthersProvider).decimals()

  return {
    name: toName,
    chainId: toChainId,
    address: toAddress,
    mode: Mode.ERC20,
    mediator: toMediatorAddress,
    decimals: decimals.toString(),
  }
}

export const fetchToToken = async (
  bridgeDirection: string,
  fromToken: OmnibridgeTokenWithAddressAndChain & { mode: Mode; name: string },
  toChainId: ChainId,
  providers?: EcoBridgeProviders
) => {
  try {
    return await fetchToTokenDetails(bridgeDirection, fromToken, toChainId, providers)
  } catch (e) {
    return
  }
}

//calculate fee and toAmount
const processMediatorData = async (
  direction: string,
  provider?: Provider
): Promise<{ feeManagerAddress: string; currentDay: BigNumber } | undefined> => {
  const abi = [
    'function getCurrentDay() view returns (uint256)',
    'function feeManager() public view returns (address)',
    'function getBridgeInterfacesVersion() external pure returns (uint64, uint64, uint64)',
  ]

  const { homeMediatorAddress } = BRIDGE_CONFIG[direction]

  const mediatorContract = new Contract(homeMediatorAddress, abi, provider)

  const [interfaceVersion, currentDay] = await Promise.all([
    mediatorContract.getBridgeInterfacesVersion() as BigNumber[],
    mediatorContract.getCurrentDay() as BigNumber,
  ])

  if (!interfaceVersion || !currentDay) return

  const version = interfaceVersion.map(v => v.toNumber()).join('.')

  if (version >= '2.1.0') {
    return { feeManagerAddress: await mediatorContract.feeManager(), currentDay }
  } else {
    return { feeManagerAddress: homeMediatorAddress, currentDay }
  }
}

export const checkRewardAddress = async (
  feeManagerAddress: string,
  account: string,
  provider?: Provider
): Promise<boolean> => {
  const abi = ['function isRewardAddress(address) view returns (bool)']
  const feeManagerContract = new Contract(feeManagerAddress, abi, provider)

  return await feeManagerContract.isRewardAddress(account)
}

export const calculateFees = async (direction: string, provider?: Provider) => {
  if (!provider) return
  try {
    const abi = [
      'function FOREIGN_TO_HOME_FEE() view returns (bytes32)',
      'function HOME_TO_FOREIGN_FEE() view returns (bytes32)',
    ]

    const mediatorData = await processMediatorData(direction, provider)

    if (!mediatorData) return

    const { feeManagerAddress, currentDay } = mediatorData

    const feeManagerContract = new Contract(feeManagerAddress, abi, provider)

    const [foreignToHomeFee, homeToForeignFee] = await Promise.all<string>([
      feeManagerContract.FOREIGN_TO_HOME_FEE(),
      feeManagerContract.HOME_TO_FOREIGN_FEE(),
    ])

    return { foreignToHomeFee, homeToForeignFee, feeManagerAddress, currentDay }
  } catch (e) {
    return
  }
}

export const fetchToAmount = async (
  direction: string,
  feeType: string,
  fromToken: OmnibridgeTokenWithAddressAndChain & { name: string; mediator: string },
  toToken: OmnibridgeTokenWithAddressAndChain & { name: string; mediator: string },
  fromAmount: BigNumber,
  feeManagerAddress: string,
  provider?: Provider
) => {
  if (fromAmount.lte(0) || !fromToken || !toToken) return BigNumber.from(0)

  const { homeChainId, homeMediatorAddress } = BRIDGE_CONFIG[direction]

  const isHome = homeChainId === toToken.chainId
  const tokenAddress = isHome ? toToken.address : fromToken.address
  const mediatorAddress = isHome ? toToken.mediator : fromToken.mediator

  if (mediatorAddress !== homeMediatorAddress) {
    return fromAmount
  }

  try {
    const abi = ['function calculateFee(bytes32, address, uint256) view returns (uint256)']
    const feeManagerContract = new Contract(feeManagerAddress, abi, provider)

    const fee = await feeManagerContract.calculateFee(feeType, tokenAddress, fromAmount)

    return fromAmount.sub(fee)
  } catch (e) {
    return fromAmount
  }
}

//allowance
export const fetchAllowance = async (
  { mediator, address }: { address: string; mediator?: string },
  account: string,
  provider?: Provider
): Promise<BigNumber | undefined> => {
  if (address === ZERO_ADDRESS || !mediator || mediator === ZERO_ADDRESS || !provider) return

  try {
    const abi = ['function allowance(address, address) view returns (uint256)']
    const tokenContract = new Contract(address, abi, provider)
    return tokenContract.allowance(account, mediator)
  } catch (e) {
    return
  }
}

export const approveToken = async (
  { address, mediator }: { address: string; mediator: string },
  amount: string,
  signer?: Signer
): Promise<ContractTransaction> => {
  const abi = ['function approve(address, uint256)']
  const tokenContract = new Contract(address, abi, signer)
  return tokenContract.approve(mediator, amount)
}

//tx limits
export const fetchTokenLimits = async (
  direction: string,
  token: OmnibridgeToken,
  toToken: OmnibridgeToken,
  currentDay: BigNumber,
  staticProviders: EcoBridgeProviders
) => {
  if (!token.mediator || !toToken.mediator) return

  const fromProvider = staticProviders[token.chainId]
  const toProvider = staticProviders[toToken.chainId]
  const isDedicatedMediatorToken = token.mediator !== getMediatorAddressWithoutOverride(direction, token.chainId)

  const abi = isDedicatedMediatorToken
    ? [
        'function minPerTx() view returns (uint256)',
        'function executionMaxPerTx() view returns (uint256)',
        'function executionDailyLimit() view returns (uint256)',
        'function totalExecutedPerDay(uint256) view returns (uint256)',
      ]
    : [
        'function minPerTx(address) view returns (uint256)',
        'function executionMaxPerTx(address) view returns (uint256)',
        'function executionDailyLimit(address) view returns (uint256)',
        'function totalExecutedPerDay(address, uint256) view returns (uint256)',
      ]

  try {
    const mediatorContract = new Contract(token.mediator, abi, fromProvider)
    const toMediatorContract = new Contract(toToken.mediator, abi, toProvider)

    const [minPerTx, executionMaxPerTx, executionDailyLimit, totalExecutedPerDay] = isDedicatedMediatorToken
      ? await Promise.all<BigNumber>([
          mediatorContract.minPerTx(),
          toMediatorContract.executionMaxPerTx(),
          mediatorContract.executionDailyLimit(),
          toMediatorContract.totalExecutedPerDay(currentDay),
        ])
      : await Promise.all<BigNumber>([
          mediatorContract.minPerTx(token.address),
          toMediatorContract.executionMaxPerTx(toToken.address),
          mediatorContract.executionDailyLimit(token.address),
          toMediatorContract.totalExecutedPerDay(toToken.address, currentDay),
        ])

    return {
      minPerTx,
      maxPerTx: executionMaxPerTx,
      dailyLimit: executionDailyLimit.sub(totalExecutedPerDay),
    }
  } catch (e) {
    return
  }
}

//bridge transfer
export const relayTokens = async (
  signer: Signer,
  token: { address: string; mode: Mode; mediator: string },
  receiver: string,
  amount: string,
  { shouldReceiveNativeCur, foreignChainId }: { shouldReceiveNativeCur: boolean; foreignChainId: ChainId }
): Promise<ContractTransaction> => {
  const { mode, mediator, address } = token

  const helperContractAddress = nativeCurrencyMediators[foreignChainId || 1]

  switch (mode) {
    case Mode.NATIVE: {
      const abi = ['function wrapAndRelayTokens(address _receiver) public payable']
      const helperContract = new Contract(helperContractAddress, abi, signer)
      return helperContract.wrapAndRelayTokens(receiver, { value: amount })
    }
    case Mode.ERC677: {
      const abi = ['function transferAndCall(address, uint256, bytes)']
      const tokenContract = new Contract(address, abi, signer)
      const foreignHelperContract = nativeCurrencyMediators[foreignChainId || 1]
      const bytesData =
        shouldReceiveNativeCur && foreignHelperContract
          ? `${foreignHelperContract}${receiver.replace('0x', '')}`
          : receiver
      return tokenContract.transferAndCall(mediator, amount, bytesData)
    }
    case Mode.DEDICATED_ERC20: {
      const abi = ['function relayTokens(address, uint256)']
      const mediatorContract = new Contract(mediator, abi, signer)
      return mediatorContract.relayTokens(receiver, amount)
    }
    case Mode.ERC20:
    default: {
      const abi = ['function relayTokens(address, address, uint256)']
      const mediatorContract = new Contract(mediator, abi, signer)
      return mediatorContract.relayTokens(token.address, receiver, amount)
    }
  }
}

//txs history
export const combineTransactions = (
  requests: OmnibridgeRequest[],
  executions: OmnibridgeExecution[],
  chainId: ChainId,
  bridgeChainId: ChainId
) =>
  requests.map(request => {
    const execution = executions.find(exec => exec.messageId === request.messageId)

    const { amount, txHash, symbol, timestamp, user, message, decimals, token } = request

    return {
      txHash,
      assetName: symbol,
      assetAddressL1: token,
      value: formatUnits(amount, decimals),
      fromChainId: chainId,
      toChainId: bridgeChainId,
      sender: user,
      timestampResolved: Number(timestamp) * 1000,
      message,
      partnerTxHash: execution?.txHash,
      status: execution?.status,
    }
  })

export const getTransactionStatus = (
  status: boolean | undefined | string,
  isClaimed: boolean,
  isFailed: boolean,
  hasSignatures: boolean
): BridgeTransactionStatus => {
  if (status === BridgeTransactionStatus.PENDING) {
    return BridgeTransactionStatus.PENDING
  }

  if (!isClaimed) {
    return BridgeTransactionStatus.REDEEM
  }

  if (isClaimed) {
    if (isFailed) {
      return BridgeTransactionStatus.FAILED
    }
    if (hasSignatures) {
      return BridgeTransactionStatus.CLAIMED
    }
    return BridgeTransactionStatus.CONFIRMED
  }
  return BridgeTransactionStatus.LOADING
}

//collect
export const requiredSignatures = async (homeAmbAddress: string, homeProvider: Provider) => {
  const abi = ['function requiredSignatures() public view returns (uint256)']
  const ambContract = new Contract(homeAmbAddress, abi, homeProvider)
  const numRequired = await ambContract.requiredSignatures()
  const signatures = Number.parseInt(numRequired.toString(), 10)

  return signatures
}

export const getMessageData = async (
  isHome: boolean,
  provider: Provider,
  txHash: string,
  txReceipt?: TransactionReceipt
): Promise<{
  messageId: string
  messageData: string
}> => {
  const abi = isHome
    ? new utils.Interface(['event UserRequestForSignature(bytes32 indexed messageId, bytes encodedData)'])
    : new utils.Interface(['event UserRequestForAffirmation(bytes32 indexed messageId, bytes encodedData)'])
  let receipt = txReceipt
  if (!receipt) {
    try {
      receipt = await provider.getTransactionReceipt(txHash)
    } catch (error) {
      throw Error('Invalid hash.')
    }
  }
  if (!receipt || !receipt.logs) {
    throw Error('No transaction found.')
  }
  const eventFragment = abi.events[Object.keys(abi.events)[0]]
  const eventTopic = abi.getEventTopic(eventFragment)
  const event = receipt.logs.find(e => e.topics[0] === eventTopic)
  if (!event) {
    throw Error('It is not a bridge transaction. Specify hash of a transaction sending tokens to the bridge.')
  }
  const decodedLog = abi.decodeEventLog(eventFragment, event.data, event.topics)

  return {
    messageId: decodedLog.messageId,
    messageData: decodedLog.encodedData,
  }
}

export const getMessage = async (
  isHome: boolean,
  ambAddress: string,
  txHash: string,
  provider: Provider
): Promise<{
  messageData: string
  signatures: string[]
  messageId: string
}> => {
  const { messageId, messageData } = await getMessageData(isHome, provider, txHash)
  const messageHash = utils.solidityKeccak256(['bytes'], [messageData])

  const abi = [
    'function isAlreadyProcessed(uint256 _number) public pure returns (bool)',
    'function requiredSignatures() public view returns (uint256)',
    'function numMessagesSigned(bytes32 _message) public view returns (uint256)',
    'function signature(bytes32 _hash, uint256 _index) public view returns (bytes)',
  ]
  const ambContract = new Contract(ambAddress, abi, provider)
  const [requiredSignatures, numMessagesSigned] = await Promise.all([
    ambContract.requiredSignatures(),
    ambContract.numMessagesSigned(messageHash),
  ])

  const isEnoughCollected = await ambContract.isAlreadyProcessed(numMessagesSigned)
  if (!isEnoughCollected) {
    throw Error('Not enough collected signatures')
  }
  const signatures = await Promise.all(
    Array(requiredSignatures.toNumber())
      .fill(null)
      .map((_item, index) => ambContract.signature(messageHash, index))
  )
  return {
    messageData,
    signatures,
    messageId,
  }
}

export const messageCallStatus = async (
  ambAddress: string,
  messageId: string,
  provider: Provider
): Promise<boolean> => {
  const abi = ['function messageCallStatus(bytes32 _messageId) public view returns (bool)']
  const ambContract = new Contract(ambAddress, abi, provider)
  const claimed: boolean = await ambContract.messageCallStatus(messageId)
  return claimed
}

const packSignatures = (array: { r: string; s: string; v: string }[]) => {
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

const signatureToVRS = (rawSignature: string) => {
  const signature = rawSignature.replace(/^0x/, '')
  const v = signature.substr(64 * 2)
  const r = signature.substr(0, 32 * 2)
  const s = signature.substr(32 * 2, 32 * 2)
  return { v, r, s }
}

export const executeSignatures = async (
  address: string,
  version: string,
  { messageData, signatures }: { messageData: string; signatures: string[] },
  signer: Signer
): Promise<ContractTransaction> => {
  const abi = [
    'function executeSignatures(bytes messageData, bytes signatures) external',
    'function safeExecuteSignaturesWithAutoGasLimit(bytes _data, bytes _signatures) external',
  ]
  const ambContract = new Contract(address, abi, signer)

  let executeSignaturesFunc = ambContract.executeSignatures
  if (version > '5.6.0') {
    executeSignaturesFunc = ambContract.safeExecuteSignaturesWithAutoGasLimit
  }

  if (!signatures || signatures.length === 0) {
    throw new Error('Not enough collected signatures')
  }

  const signs = packSignatures(signatures.map(s => signatureToVRS(s)))

  const tx = await executeSignaturesFunc(messageData, signs)
  return tx
}
export const fetchAmbVersion = async (address: string, provider: Provider) => {
  if (!provider) {
    return '0.0.0'
  }
  const abi = ['function getBridgeInterfacesVersion() external pure returns (uint64, uint64, uint64)']
  const ambContract = new Contract(address, abi, provider)
  const ambVersion: BigNumber[] = await ambContract.getBridgeInterfacesVersion()

  return ambVersion.map(v => v.toNumber()).join('.')
}

export const timeout = (ms: number, promise: Promise<any>): Promise<TransactionReceipt> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('timeout - tx receipt'))
    }, ms)

    promise
      .then(value => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch(error => {
        clearTimeout(timer)
        reject(error)
      })
  })

export const fetchConfirmations = async (address: string, provider: Provider) => {
  const abi = ['function requiredBlockConfirmations() view returns (uint256)']
  const ambContract = new Contract(address, abi, provider)
  const requiredConfirmations = await ambContract.requiredBlockConfirmations()

  return parseInt(requiredConfirmations, 10)
}
