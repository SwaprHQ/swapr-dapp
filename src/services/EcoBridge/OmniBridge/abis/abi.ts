import { utils } from 'ethers'

// common for home and foreign
export const MEDIATOR_ABI = [
  'function isRegisteredAsNativeToken(address) view returns (bool)',
  'function bridgedTokenAddress(address) view returns (address)',
  'function nativeTokenAddress(address) view returns (address)',
]

export const HOME_MEDIATOR_ABI = [
  'function getCurrentDay() view returns (uint256)',
  'function feeManager() public view returns (address)',
  'function getBridgeInterfacesVersion() external pure returns (uint64, uint64, uint64)',
]

export const HOME_AMB_ABI = [
  'function requiredSignatures() public view returns (uint256)',
  'function isAlreadyProcessed(uint256 _number) public pure returns (bool)',
  'function numMessagesSigned(bytes32 _message) public view returns (uint256)',
  'function signature(bytes32 _hash, uint256 _index) public view returns (bytes)',
]

export const FOREIGN_AMB_ABI = [
  'function executeSignatures(bytes messageData, bytes signatures) external',
  'function safeExecuteSignaturesWithAutoGasLimit(bytes _data, bytes _signatures) external',
  'function getBridgeInterfacesVersion() external pure returns (uint64, uint64, uint64)',
]

export const FEE_MANAGER_REWARD_ADDRESS_ABI = ['function isRewardAddress(address) view returns (bool)']

export const FEE_MANAGER_TYPE_ABI = [
  'function FOREIGN_TO_HOME_FEE() view returns (bytes32)',
  'function HOME_TO_FOREIGN_FEE() view returns (bytes32)',
]

export const FEE_MANAGER_CALCULATE_ABI = ['function calculateFee(bytes32, address, uint256) view returns (uint256)']

export const DEDICATED_MEDIATOR_TOKEN_ABI = [
  'function minPerTx() view returns (uint256)',
  'function executionMaxPerTx() view returns (uint256)',
  'function executionDailyLimit() view returns (uint256)',
  'function totalExecutedPerDay(uint256) view returns (uint256)',
]

export const MEDIATOR_TOKEN_ABI = [
  'function minPerTx(address) view returns (uint256)',
  'function executionMaxPerTx(address) view returns (uint256)',
  'function executionDailyLimit(address) view returns (uint256)',
  'function totalExecutedPerDay(address, uint256) view returns (uint256)',
]

export const NATIVE_ABI = ['function wrapAndRelayTokens(address _receiver) public payable']

export const MEDIATOR_ERC677_TOKEN_ABI = ['function transferAndCall(address, uint256, bytes)']

export const MEDIATOR_DEDICATED_ERC20_ABI = ['function relayTokens(address, uint256)']

export const MEDIATOR_ERC20_ABI = ['function relayTokens(address, address, uint256)']

export const MESSAGE_CALL_STATUS_ABI = ['function messageCallStatus(bytes32 _messageId) public view returns (bool)']

export const REQUIRED_BLOCKS_ABI = ['function requiredBlockConfirmations() view returns (uint256)']

export const MESSAGE_SIGNATURES_ABI = new utils.Interface([
  'event UserRequestForSignature(bytes32 indexed messageId, bytes encodedData)',
])

export const MESSAGE_AFFIRMATION_ABI = new utils.Interface([
  'event UserRequestForAffirmation(bytes32 indexed messageId, bytes encodedData)',
])
export const AMB_INTERFACE_VERISON_ABI = [
  'function getBridgeInterfacesVersion() external pure returns (uint64, uint64, uint64)',
]
