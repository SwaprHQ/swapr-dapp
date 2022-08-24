import { Provider, TransactionReceipt } from '@ethersproject/abstract-provider'
import { ChainId, MULTICALL2_ABI, MULTICALL2_ADDRESS, WETH } from '@swapr/sdk'

import { BigNumber, Contract, ContractTransaction, Signer, utils } from 'ethers'
import { BytesLike, formatUnits } from 'ethers/lib/utils'
import { gql } from 'graphql-request'

import { ZERO_ADDRESS } from '../../../constants'
import { ERC20_BYTES32_ABI } from '../../../constants/abis/erc20'
import ERC20_ABI from '../../../constants/abis/erc20.json'
import { BridgeTransactionStatus } from '../../../state/bridgeTransactions/types'
import { EcoBridgeProviders } from '../EcoBridge.types'
import {
  AMB_INTERFACE_VERISON_ABI,
  DEDICATED_MEDIATOR_TOKEN_ABI,
  FEE_MANAGER_CALCULATE_ABI,
  FEE_MANAGER_REWARD_ADDRESS_ABI,
  FEE_MANAGER_TYPE_ABI,
  FOREIGN_AMB_ABI,
  HOME_AMB_ABI,
  HOME_MEDIATOR_ABI,
  MEDIATOR_ABI,
  MEDIATOR_DEDICATED_ERC20_ABI,
  MEDIATOR_ERC20_ABI,
  MEDIATOR_ERC677_TOKEN_ABI,
  MEDIATOR_TOKEN_ABI,
  MESSAGE_AFFIRMATION_ABI,
  MESSAGE_CALL_STATUS_ABI,
  MESSAGE_SIGNATURES_ABI,
  NATIVE_ABI,
  REQUIRED_BLOCKS_ABI,
} from './abis/abi'
import { BRIDGE_CONFIG, nativeCurrencyMediators, OVERRIDES } from './OmniBridge.config'
import {
  Mode,
  OmnibridgeExecution,
  OmnibridgeRequest,
  OmnibridgeToken,
  OmnibridgeTokenWithAddressAndChain,
} from './OmniBridge.types'

const bytesTerminator = '0x0000000000000000000000000000000000000000000000000000000000000020'

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

  if (!mediatorAddress) return

  const mediatorContract = new Contract(mediatorAddress, MEDIATOR_ABI, provider)
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
    const tokenContractString = new Contract(token.address, ERC20_ABI, provider)
    tokenName = await tokenContractString.name()
  } catch {
    const tokenContractBytes32 = new Contract(token.address, ERC20_BYTES32_ABI, provider)
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

const multicallCache = new Map<ChainId, Contract>()

const fetchTokenDetailsStringAndBytes = async (
  token: OmnibridgeTokenWithAddressAndChain,
  provider?: Provider
): Promise<{ name: string; symbol: string; decimals: number }> => {
  const contract = new Contract(token.address, ERC20_ABI, provider)
  const contractBytes = new Contract(token.address, ERC20_BYTES32_ABI, provider)

  const coders = [contract, contractBytes].reduce<{
    callData: { target: string; callData: string }[]
    decoders: ((result: BytesLike[]) => utils.Result)[]
  }>(
    (total, contract) => {
      ;['name', 'symbol', 'decimals'].forEach(name => {
        total.callData.push({ target: contract.address, callData: contract.interface.encodeFunctionData(name) })
        total.decoders.push((result: BytesLike[]) => contract.interface.decodeFunctionResult(name, result[1]))
      })
      return total
    },
    { callData: [], decoders: [] }
  )

  let multicall: Contract | undefined

  if (multicallCache.has(token.chainId)) {
    multicall = multicallCache.get(token.chainId) as Contract
  } else {
    multicall = new Contract(MULTICALL2_ADDRESS[token.chainId], MULTICALL2_ABI, provider)
    multicallCache.set(token.chainId, multicall)
  }

  const multicallData = await multicall.callStatic.tryAggregate(false, coders.callData)

  const decodedData: [BytesLike[]] = multicallData.map((res: BytesLike[], index: number) => coders.decoders[index](res))

  const [name, symbol, decimals, nameBytes, symbolBytes, decimalsBytes] = decodedData.flat()

  if (nameBytes === bytesTerminator && symbolBytes === bytesTerminator) {
    return {
      name: name.toString(),
      symbol: symbol.toString(),
      decimals: Number(decimals),
    }
  } else {
    return {
      name: utils.parseBytes32String(nameBytes as BytesLike),
      symbol: utils.parseBytes32String(symbolBytes as BytesLike),
      decimals: Number(decimalsBytes),
    }
  }
}

const fetchTokenDetailsFromContract = async (
  token: OmnibridgeTokenWithAddressAndChain,
  provider?: Provider
): Promise<{ name: string; symbol: string; decimals: number }> => {
  try {
    return await fetchTokenDetailsStringAndBytes(token, provider)
  } catch (e) {
    return { name: '', symbol: '', decimals: 0 }
  }
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
    const toAddress = WETH[ChainId.XDAI].address

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

  const fromMediatorContract = new Contract(fromMediatorAddress, MEDIATOR_ABI, fromEthersProvider)

  const isNativeToken = await fromMediatorContract.isRegisteredAsNativeToken(fromTokenAddress)

  if (isNativeToken) {
    const toMediatorContract = new Contract(toMediatorAddress, MEDIATOR_ABI, toEthersProvider)

    const toAddress = await toMediatorContract.bridgedTokenAddress(fromTokenAddress)

    const toName = await getToName(fromToken, toChainId, toAddress, toEthersProvider)

    const decimals = await new Contract(toAddress, ERC20_ABI, toEthersProvider).decimals()

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

  const decimals = await new Contract(toAddress, ERC20_ABI, toEthersProvider).decimals()

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
  const { homeMediatorAddress } = BRIDGE_CONFIG[direction]

  const mediatorContract = new Contract(homeMediatorAddress, HOME_MEDIATOR_ABI, provider)

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
  const feeManagerContract = new Contract(feeManagerAddress, FEE_MANAGER_REWARD_ADDRESS_ABI, provider)

  return await feeManagerContract.isRewardAddress(account)
}

export const calculateFees = async (direction: string, provider?: Provider) => {
  if (!provider) return
  try {
    const mediatorData = await processMediatorData(direction, provider)

    if (!mediatorData) return

    const { feeManagerAddress, currentDay } = mediatorData

    const feeManagerContract = new Contract(feeManagerAddress, FEE_MANAGER_TYPE_ABI, provider)

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

  const isHomeChainId = homeChainId === toToken.chainId
  const tokenAddress = isHomeChainId ? toToken.address : fromToken.address
  const mediatorAddress = isHomeChainId ? toToken.mediator : fromToken.mediator

  if (mediatorAddress !== homeMediatorAddress) {
    return fromAmount
  }

  try {
    const feeManagerContract = new Contract(feeManagerAddress, FEE_MANAGER_CALCULATE_ABI, provider)

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
    const tokenContract = new Contract(address, ERC20_ABI, provider)
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
  const tokenContract = new Contract(address, ERC20_ABI, signer)
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

  const ABI = isDedicatedMediatorToken ? DEDICATED_MEDIATOR_TOKEN_ABI : MEDIATOR_TOKEN_ABI

  try {
    const mediatorContract = new Contract(token.mediator, ABI, fromProvider)
    const toMediatorContract = new Contract(toToken.mediator, ABI, toProvider)

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
  { shouldReceiveNativeCurrency, foreignChainId }: { shouldReceiveNativeCurrency: boolean; foreignChainId: ChainId }
): Promise<ContractTransaction> => {
  const { mode, mediator, address } = token

  const helperContractAddress = nativeCurrencyMediators[foreignChainId || 1]

  switch (mode) {
    case Mode.NATIVE: {
      const helperContract = new Contract(helperContractAddress, NATIVE_ABI, signer)
      return helperContract.wrapAndRelayTokens(receiver, { value: amount })
    }
    case Mode.ERC677: {
      const tokenContract = new Contract(address, MEDIATOR_ERC677_TOKEN_ABI, signer)
      const foreignHelperContract = nativeCurrencyMediators[foreignChainId || 1]
      const bytesData =
        shouldReceiveNativeCurrency && foreignHelperContract
          ? `${foreignHelperContract}${receiver.replace('0x', '')}`
          : receiver
      return tokenContract.transferAndCall(mediator, amount, bytesData)
    }
    case Mode.DEDICATED_ERC20: {
      const mediatorContract = new Contract(mediator, MEDIATOR_DEDICATED_ERC20_ABI, signer)
      return mediatorContract.relayTokens(receiver, amount)
    }
    case Mode.ERC20:
    default: {
      const mediatorContract = new Contract(mediator, MEDIATOR_ERC20_ABI, signer)
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
      fromValue: formatUnits(amount, decimals),
      toValue: '0', // @TODO: add toValue
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

  if (isFailed) {
    return BridgeTransactionStatus.FAILED
  }
  if (hasSignatures) {
    return BridgeTransactionStatus.CLAIMED
  }
  return BridgeTransactionStatus.CONFIRMED
}

//collect
export const requiredSignatures = async (homeAmbAddress: string, homeProvider: Provider) => {
  const ambContract = new Contract(homeAmbAddress, HOME_AMB_ABI, homeProvider)
  const numRequired = await ambContract.requiredSignatures()
  const signatures = Number.parseInt(numRequired.toString(), 10)

  return signatures
}

export const getMessageData = async (
  isHomeChainId: boolean,
  provider: Provider,
  txHash: string,
  txReceipt?: TransactionReceipt
): Promise<{
  messageId: string
  messageData: string
}> => {
  const ABI = isHomeChainId ? MESSAGE_SIGNATURES_ABI : MESSAGE_AFFIRMATION_ABI

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
  const eventFragment = ABI.events[Object.keys(ABI.events)[0]]
  const eventTopic = ABI.getEventTopic(eventFragment)
  const event = receipt.logs.find(e => e.topics[0] === eventTopic)

  if (!event) {
    throw Error('It is not a bridge transaction. Specify hash of a transaction sending tokens to the bridge.')
  }
  const decodedLog = ABI.decodeEventLog(eventFragment, event.data, event.topics)

  return {
    messageId: decodedLog.messageId,
    messageData: decodedLog.encodedData,
  }
}

export const getMessage = async (
  isHomeChainId: boolean,
  txHash: string,
  provider: Provider,
  ambContract: Contract
): Promise<{
  messageData: string
  signatures: string[]
  messageId: string
}> => {
  const { messageId, messageData } = await getMessageData(isHomeChainId, provider, txHash)
  const messageHash = utils.solidityKeccak256(['bytes'], [messageData])

  const [requiredSignatures, numMessagesSigned] = await Promise.all([
    ambContract.requiredSignatures(),
    ambContract.numMessagesSigned(messageHash),
  ])

  const isEnoughCollected = await ambContract?.isAlreadyProcessed(numMessagesSigned)
  if (!isEnoughCollected) {
    throw Error('Not enough collected signatures')
  }
  const signatures = await Promise.all(
    Array(requiredSignatures.toNumber())
      .fill(null)
      .map((_item, index) => ambContract?.signature(messageHash, index))
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
  const ambContract = new Contract(ambAddress, MESSAGE_CALL_STATUS_ABI, provider)
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
  const ambContract = new Contract(address, FOREIGN_AMB_ABI, signer)

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

  const ambContract = new Contract(address, AMB_INTERFACE_VERISON_ABI, provider)
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
  const ambContract = new Contract(address, REQUIRED_BLOCKS_ABI, provider)
  const requiredConfirmations = await ambContract.requiredBlockConfirmations()

  return parseInt(requiredConfirmations, 10)
}
