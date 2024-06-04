import { gql } from '@apollo/client'
import * as Apollo from '@apollo/client'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
const defaultOptions = {} as const
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  BigDecimal: any
  BigInt: any
  Bytes: any
  Int8: any
  Timestamp: any
}

export enum Aggregation_Interval {
  Day = 'day',
  Hour = 'hour',
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int']
}

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']>
  number?: InputMaybe<Scalars['Int']>
  number_gte?: InputMaybe<Scalars['Int']>
}

export type Bundle = {
  __typename?: 'Bundle'
  id: Scalars['ID']
  nativeCurrencyPrice: Scalars['BigDecimal']
}

export type Bundle_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<Bundle_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  nativeCurrencyPrice?: InputMaybe<Scalars['BigDecimal']>
  nativeCurrencyPrice_gt?: InputMaybe<Scalars['BigDecimal']>
  nativeCurrencyPrice_gte?: InputMaybe<Scalars['BigDecimal']>
  nativeCurrencyPrice_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  nativeCurrencyPrice_lt?: InputMaybe<Scalars['BigDecimal']>
  nativeCurrencyPrice_lte?: InputMaybe<Scalars['BigDecimal']>
  nativeCurrencyPrice_not?: InputMaybe<Scalars['BigDecimal']>
  nativeCurrencyPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  or?: InputMaybe<Array<InputMaybe<Bundle_Filter>>>
}

export enum Bundle_OrderBy {
  Id = 'id',
  NativeCurrencyPrice = 'nativeCurrencyPrice',
}

export type Burn = {
  __typename?: 'Burn'
  amount0?: Maybe<Scalars['BigDecimal']>
  amount1?: Maybe<Scalars['BigDecimal']>
  amountUSD?: Maybe<Scalars['BigDecimal']>
  feeLiquidity?: Maybe<Scalars['BigDecimal']>
  feeTo?: Maybe<Scalars['Bytes']>
  id: Scalars['ID']
  liquidity: Scalars['BigDecimal']
  logIndex?: Maybe<Scalars['BigInt']>
  needsComplete: Scalars['Boolean']
  pair: Pair
  sender?: Maybe<Scalars['Bytes']>
  timestamp: Scalars['BigInt']
  to?: Maybe<Scalars['Bytes']>
  transaction: Transaction
}

export type Burn_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  amount0?: InputMaybe<Scalars['BigDecimal']>
  amount0_gt?: InputMaybe<Scalars['BigDecimal']>
  amount0_gte?: InputMaybe<Scalars['BigDecimal']>
  amount0_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount0_lt?: InputMaybe<Scalars['BigDecimal']>
  amount0_lte?: InputMaybe<Scalars['BigDecimal']>
  amount0_not?: InputMaybe<Scalars['BigDecimal']>
  amount0_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount1?: InputMaybe<Scalars['BigDecimal']>
  amount1_gt?: InputMaybe<Scalars['BigDecimal']>
  amount1_gte?: InputMaybe<Scalars['BigDecimal']>
  amount1_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount1_lt?: InputMaybe<Scalars['BigDecimal']>
  amount1_lte?: InputMaybe<Scalars['BigDecimal']>
  amount1_not?: InputMaybe<Scalars['BigDecimal']>
  amount1_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amountUSD?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amountUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_not?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  and?: InputMaybe<Array<InputMaybe<Burn_Filter>>>
  feeLiquidity?: InputMaybe<Scalars['BigDecimal']>
  feeLiquidity_gt?: InputMaybe<Scalars['BigDecimal']>
  feeLiquidity_gte?: InputMaybe<Scalars['BigDecimal']>
  feeLiquidity_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  feeLiquidity_lt?: InputMaybe<Scalars['BigDecimal']>
  feeLiquidity_lte?: InputMaybe<Scalars['BigDecimal']>
  feeLiquidity_not?: InputMaybe<Scalars['BigDecimal']>
  feeLiquidity_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  feeTo?: InputMaybe<Scalars['Bytes']>
  feeTo_contains?: InputMaybe<Scalars['Bytes']>
  feeTo_gt?: InputMaybe<Scalars['Bytes']>
  feeTo_gte?: InputMaybe<Scalars['Bytes']>
  feeTo_in?: InputMaybe<Array<Scalars['Bytes']>>
  feeTo_lt?: InputMaybe<Scalars['Bytes']>
  feeTo_lte?: InputMaybe<Scalars['Bytes']>
  feeTo_not?: InputMaybe<Scalars['Bytes']>
  feeTo_not_contains?: InputMaybe<Scalars['Bytes']>
  feeTo_not_in?: InputMaybe<Array<Scalars['Bytes']>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  liquidity?: InputMaybe<Scalars['BigDecimal']>
  liquidity_gt?: InputMaybe<Scalars['BigDecimal']>
  liquidity_gte?: InputMaybe<Scalars['BigDecimal']>
  liquidity_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  liquidity_lt?: InputMaybe<Scalars['BigDecimal']>
  liquidity_lte?: InputMaybe<Scalars['BigDecimal']>
  liquidity_not?: InputMaybe<Scalars['BigDecimal']>
  liquidity_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  logIndex?: InputMaybe<Scalars['BigInt']>
  logIndex_gt?: InputMaybe<Scalars['BigInt']>
  logIndex_gte?: InputMaybe<Scalars['BigInt']>
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>
  logIndex_lt?: InputMaybe<Scalars['BigInt']>
  logIndex_lte?: InputMaybe<Scalars['BigInt']>
  logIndex_not?: InputMaybe<Scalars['BigInt']>
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  needsComplete?: InputMaybe<Scalars['Boolean']>
  needsComplete_in?: InputMaybe<Array<Scalars['Boolean']>>
  needsComplete_not?: InputMaybe<Scalars['Boolean']>
  needsComplete_not_in?: InputMaybe<Array<Scalars['Boolean']>>
  or?: InputMaybe<Array<InputMaybe<Burn_Filter>>>
  pair?: InputMaybe<Scalars['String']>
  pair_?: InputMaybe<Pair_Filter>
  pair_contains?: InputMaybe<Scalars['String']>
  pair_contains_nocase?: InputMaybe<Scalars['String']>
  pair_ends_with?: InputMaybe<Scalars['String']>
  pair_ends_with_nocase?: InputMaybe<Scalars['String']>
  pair_gt?: InputMaybe<Scalars['String']>
  pair_gte?: InputMaybe<Scalars['String']>
  pair_in?: InputMaybe<Array<Scalars['String']>>
  pair_lt?: InputMaybe<Scalars['String']>
  pair_lte?: InputMaybe<Scalars['String']>
  pair_not?: InputMaybe<Scalars['String']>
  pair_not_contains?: InputMaybe<Scalars['String']>
  pair_not_contains_nocase?: InputMaybe<Scalars['String']>
  pair_not_ends_with?: InputMaybe<Scalars['String']>
  pair_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  pair_not_in?: InputMaybe<Array<Scalars['String']>>
  pair_not_starts_with?: InputMaybe<Scalars['String']>
  pair_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  pair_starts_with?: InputMaybe<Scalars['String']>
  pair_starts_with_nocase?: InputMaybe<Scalars['String']>
  sender?: InputMaybe<Scalars['Bytes']>
  sender_contains?: InputMaybe<Scalars['Bytes']>
  sender_gt?: InputMaybe<Scalars['Bytes']>
  sender_gte?: InputMaybe<Scalars['Bytes']>
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>
  sender_lt?: InputMaybe<Scalars['Bytes']>
  sender_lte?: InputMaybe<Scalars['Bytes']>
  sender_not?: InputMaybe<Scalars['Bytes']>
  sender_not_contains?: InputMaybe<Scalars['Bytes']>
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>
  timestamp?: InputMaybe<Scalars['BigInt']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']>
  timestamp_not?: InputMaybe<Scalars['BigInt']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  to?: InputMaybe<Scalars['Bytes']>
  to_contains?: InputMaybe<Scalars['Bytes']>
  to_gt?: InputMaybe<Scalars['Bytes']>
  to_gte?: InputMaybe<Scalars['Bytes']>
  to_in?: InputMaybe<Array<Scalars['Bytes']>>
  to_lt?: InputMaybe<Scalars['Bytes']>
  to_lte?: InputMaybe<Scalars['Bytes']>
  to_not?: InputMaybe<Scalars['Bytes']>
  to_not_contains?: InputMaybe<Scalars['Bytes']>
  to_not_in?: InputMaybe<Array<Scalars['Bytes']>>
  transaction?: InputMaybe<Scalars['String']>
  transaction_?: InputMaybe<Transaction_Filter>
  transaction_contains?: InputMaybe<Scalars['String']>
  transaction_contains_nocase?: InputMaybe<Scalars['String']>
  transaction_ends_with?: InputMaybe<Scalars['String']>
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']>
  transaction_gt?: InputMaybe<Scalars['String']>
  transaction_gte?: InputMaybe<Scalars['String']>
  transaction_in?: InputMaybe<Array<Scalars['String']>>
  transaction_lt?: InputMaybe<Scalars['String']>
  transaction_lte?: InputMaybe<Scalars['String']>
  transaction_not?: InputMaybe<Scalars['String']>
  transaction_not_contains?: InputMaybe<Scalars['String']>
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']>
  transaction_not_ends_with?: InputMaybe<Scalars['String']>
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  transaction_not_in?: InputMaybe<Array<Scalars['String']>>
  transaction_not_starts_with?: InputMaybe<Scalars['String']>
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  transaction_starts_with?: InputMaybe<Scalars['String']>
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum Burn_OrderBy {
  Amount0 = 'amount0',
  Amount1 = 'amount1',
  AmountUsd = 'amountUSD',
  FeeLiquidity = 'feeLiquidity',
  FeeTo = 'feeTo',
  Id = 'id',
  Liquidity = 'liquidity',
  LogIndex = 'logIndex',
  NeedsComplete = 'needsComplete',
  Pair = 'pair',
  PairCreatedAtBlockNumber = 'pair__createdAtBlockNumber',
  PairCreatedAtTimestamp = 'pair__createdAtTimestamp',
  PairId = 'pair__id',
  PairLiquidityProviderCount = 'pair__liquidityProviderCount',
  PairReserve0 = 'pair__reserve0',
  PairReserve1 = 'pair__reserve1',
  PairReserveNativeCurrency = 'pair__reserveNativeCurrency',
  PairReserveUsd = 'pair__reserveUSD',
  PairSwapFee = 'pair__swapFee',
  PairToken0Price = 'pair__token0Price',
  PairToken1Price = 'pair__token1Price',
  PairTotalSupply = 'pair__totalSupply',
  PairTrackedReserveNativeCurrency = 'pair__trackedReserveNativeCurrency',
  PairTxCount = 'pair__txCount',
  PairUntrackedVolumeUsd = 'pair__untrackedVolumeUSD',
  PairVolumeToken0 = 'pair__volumeToken0',
  PairVolumeToken1 = 'pair__volumeToken1',
  PairVolumeUsd = 'pair__volumeUSD',
  Sender = 'sender',
  Timestamp = 'timestamp',
  To = 'to',
  Transaction = 'transaction',
  TransactionBlockNumber = 'transaction__blockNumber',
  TransactionId = 'transaction__id',
  TransactionTimestamp = 'transaction__timestamp',
}

export type Claim = {
  __typename?: 'Claim'
  amounts: Array<Scalars['BigDecimal']>
  id: Scalars['ID']
  liquidityMiningCampaign: LiquidityMiningCampaign
  timestamp: Scalars['BigInt']
  user: Scalars['Bytes']
}

export type Claim_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  amounts?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_contains?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_not?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_not_contains?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_not_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>
  and?: InputMaybe<Array<InputMaybe<Claim_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  liquidityMiningCampaign?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_?: InputMaybe<LiquidityMiningCampaign_Filter>
  liquidityMiningCampaign_contains?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_contains_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_ends_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_ends_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_gt?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_gte?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_in?: InputMaybe<Array<Scalars['String']>>
  liquidityMiningCampaign_lt?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_lte?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_contains?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_contains_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_ends_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_in?: InputMaybe<Array<Scalars['String']>>
  liquidityMiningCampaign_not_starts_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_starts_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_starts_with_nocase?: InputMaybe<Scalars['String']>
  or?: InputMaybe<Array<InputMaybe<Claim_Filter>>>
  timestamp?: InputMaybe<Scalars['BigInt']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']>
  timestamp_not?: InputMaybe<Scalars['BigInt']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  user?: InputMaybe<Scalars['Bytes']>
  user_contains?: InputMaybe<Scalars['Bytes']>
  user_gt?: InputMaybe<Scalars['Bytes']>
  user_gte?: InputMaybe<Scalars['Bytes']>
  user_in?: InputMaybe<Array<Scalars['Bytes']>>
  user_lt?: InputMaybe<Scalars['Bytes']>
  user_lte?: InputMaybe<Scalars['Bytes']>
  user_not?: InputMaybe<Scalars['Bytes']>
  user_not_contains?: InputMaybe<Scalars['Bytes']>
  user_not_in?: InputMaybe<Array<Scalars['Bytes']>>
}

export enum Claim_OrderBy {
  Amounts = 'amounts',
  Id = 'id',
  LiquidityMiningCampaign = 'liquidityMiningCampaign',
  LiquidityMiningCampaignDuration = 'liquidityMiningCampaign__duration',
  LiquidityMiningCampaignEndsAt = 'liquidityMiningCampaign__endsAt',
  LiquidityMiningCampaignId = 'liquidityMiningCampaign__id',
  LiquidityMiningCampaignInitialized = 'liquidityMiningCampaign__initialized',
  LiquidityMiningCampaignLocked = 'liquidityMiningCampaign__locked',
  LiquidityMiningCampaignOwner = 'liquidityMiningCampaign__owner',
  LiquidityMiningCampaignStakedAmount = 'liquidityMiningCampaign__stakedAmount',
  LiquidityMiningCampaignStakingCap = 'liquidityMiningCampaign__stakingCap',
  LiquidityMiningCampaignStartsAt = 'liquidityMiningCampaign__startsAt',
  Timestamp = 'timestamp',
  User = 'user',
}

export type DailyUniqueAddressInteraction = {
  __typename?: 'DailyUniqueAddressInteraction'
  addresses: Array<Scalars['Bytes']>
  id: Scalars['ID']
  timestamp: Scalars['Int']
}

export type DailyUniqueAddressInteraction_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  addresses?: InputMaybe<Array<Scalars['Bytes']>>
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>
  and?: InputMaybe<Array<InputMaybe<DailyUniqueAddressInteraction_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  or?: InputMaybe<Array<InputMaybe<DailyUniqueAddressInteraction_Filter>>>
  timestamp?: InputMaybe<Scalars['Int']>
  timestamp_gt?: InputMaybe<Scalars['Int']>
  timestamp_gte?: InputMaybe<Scalars['Int']>
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>
  timestamp_lt?: InputMaybe<Scalars['Int']>
  timestamp_lte?: InputMaybe<Scalars['Int']>
  timestamp_not?: InputMaybe<Scalars['Int']>
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>
}

export enum DailyUniqueAddressInteraction_OrderBy {
  Addresses = 'addresses',
  Id = 'id',
  Timestamp = 'timestamp',
}

export type Deposit = {
  __typename?: 'Deposit'
  amount: Scalars['BigDecimal']
  id: Scalars['ID']
  liquidityMiningCampaign: LiquidityMiningCampaign
  timestamp: Scalars['BigInt']
  user: Scalars['Bytes']
}

export type Deposit_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  amount?: InputMaybe<Scalars['BigDecimal']>
  amount_gt?: InputMaybe<Scalars['BigDecimal']>
  amount_gte?: InputMaybe<Scalars['BigDecimal']>
  amount_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount_lt?: InputMaybe<Scalars['BigDecimal']>
  amount_lte?: InputMaybe<Scalars['BigDecimal']>
  amount_not?: InputMaybe<Scalars['BigDecimal']>
  amount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  and?: InputMaybe<Array<InputMaybe<Deposit_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  liquidityMiningCampaign?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_?: InputMaybe<LiquidityMiningCampaign_Filter>
  liquidityMiningCampaign_contains?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_contains_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_ends_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_ends_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_gt?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_gte?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_in?: InputMaybe<Array<Scalars['String']>>
  liquidityMiningCampaign_lt?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_lte?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_contains?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_contains_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_ends_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_in?: InputMaybe<Array<Scalars['String']>>
  liquidityMiningCampaign_not_starts_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_starts_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_starts_with_nocase?: InputMaybe<Scalars['String']>
  or?: InputMaybe<Array<InputMaybe<Deposit_Filter>>>
  timestamp?: InputMaybe<Scalars['BigInt']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']>
  timestamp_not?: InputMaybe<Scalars['BigInt']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  user?: InputMaybe<Scalars['Bytes']>
  user_contains?: InputMaybe<Scalars['Bytes']>
  user_gt?: InputMaybe<Scalars['Bytes']>
  user_gte?: InputMaybe<Scalars['Bytes']>
  user_in?: InputMaybe<Array<Scalars['Bytes']>>
  user_lt?: InputMaybe<Scalars['Bytes']>
  user_lte?: InputMaybe<Scalars['Bytes']>
  user_not?: InputMaybe<Scalars['Bytes']>
  user_not_contains?: InputMaybe<Scalars['Bytes']>
  user_not_in?: InputMaybe<Array<Scalars['Bytes']>>
}

export enum Deposit_OrderBy {
  Amount = 'amount',
  Id = 'id',
  LiquidityMiningCampaign = 'liquidityMiningCampaign',
  LiquidityMiningCampaignDuration = 'liquidityMiningCampaign__duration',
  LiquidityMiningCampaignEndsAt = 'liquidityMiningCampaign__endsAt',
  LiquidityMiningCampaignId = 'liquidityMiningCampaign__id',
  LiquidityMiningCampaignInitialized = 'liquidityMiningCampaign__initialized',
  LiquidityMiningCampaignLocked = 'liquidityMiningCampaign__locked',
  LiquidityMiningCampaignOwner = 'liquidityMiningCampaign__owner',
  LiquidityMiningCampaignStakedAmount = 'liquidityMiningCampaign__stakedAmount',
  LiquidityMiningCampaignStakingCap = 'liquidityMiningCampaign__stakingCap',
  LiquidityMiningCampaignStartsAt = 'liquidityMiningCampaign__startsAt',
  Timestamp = 'timestamp',
  User = 'user',
}

export type LiquidityMiningCampaign = {
  __typename?: 'LiquidityMiningCampaign'
  claims: Array<Claim>
  deposits: Array<Deposit>
  duration: Scalars['BigInt']
  endsAt: Scalars['BigInt']
  id: Scalars['ID']
  initialized: Scalars['Boolean']
  liquidityMiningPositionSnapshots: Array<LiquidityMiningPositionSnapshot>
  liquidityMiningPositions: Array<LiquidityMiningPosition>
  locked: Scalars['Boolean']
  owner: Scalars['Bytes']
  recoveries: Array<Recovery>
  rewards: Array<LiquidityMiningCampaignReward>
  stakablePair: Pair
  stakedAmount: Scalars['BigDecimal']
  stakingCap: Scalars['BigDecimal']
  startsAt: Scalars['BigInt']
  withdrawals: Array<Withdrawal>
}

export type LiquidityMiningCampaignClaimsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Claim_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<Claim_Filter>
}

export type LiquidityMiningCampaignDepositsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Deposit_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<Deposit_Filter>
}

export type LiquidityMiningCampaignLiquidityMiningPositionSnapshotsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityMiningPositionSnapshot_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<LiquidityMiningPositionSnapshot_Filter>
}

export type LiquidityMiningCampaignLiquidityMiningPositionsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityMiningPosition_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<LiquidityMiningPosition_Filter>
}

export type LiquidityMiningCampaignRecoveriesArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Recovery_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<Recovery_Filter>
}

export type LiquidityMiningCampaignRewardsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityMiningCampaignReward_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<LiquidityMiningCampaignReward_Filter>
}

export type LiquidityMiningCampaignWithdrawalsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Withdrawal_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<Withdrawal_Filter>
}

export type LiquidityMiningCampaignReward = {
  __typename?: 'LiquidityMiningCampaignReward'
  amount: Scalars['BigDecimal']
  id: Scalars['ID']
  token: Token
}

export type LiquidityMiningCampaignReward_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  amount?: InputMaybe<Scalars['BigDecimal']>
  amount_gt?: InputMaybe<Scalars['BigDecimal']>
  amount_gte?: InputMaybe<Scalars['BigDecimal']>
  amount_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount_lt?: InputMaybe<Scalars['BigDecimal']>
  amount_lte?: InputMaybe<Scalars['BigDecimal']>
  amount_not?: InputMaybe<Scalars['BigDecimal']>
  amount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  and?: InputMaybe<Array<InputMaybe<LiquidityMiningCampaignReward_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  or?: InputMaybe<Array<InputMaybe<LiquidityMiningCampaignReward_Filter>>>
  token?: InputMaybe<Scalars['String']>
  token_?: InputMaybe<Token_Filter>
  token_contains?: InputMaybe<Scalars['String']>
  token_contains_nocase?: InputMaybe<Scalars['String']>
  token_ends_with?: InputMaybe<Scalars['String']>
  token_ends_with_nocase?: InputMaybe<Scalars['String']>
  token_gt?: InputMaybe<Scalars['String']>
  token_gte?: InputMaybe<Scalars['String']>
  token_in?: InputMaybe<Array<Scalars['String']>>
  token_lt?: InputMaybe<Scalars['String']>
  token_lte?: InputMaybe<Scalars['String']>
  token_not?: InputMaybe<Scalars['String']>
  token_not_contains?: InputMaybe<Scalars['String']>
  token_not_contains_nocase?: InputMaybe<Scalars['String']>
  token_not_ends_with?: InputMaybe<Scalars['String']>
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  token_not_in?: InputMaybe<Array<Scalars['String']>>
  token_not_starts_with?: InputMaybe<Scalars['String']>
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  token_starts_with?: InputMaybe<Scalars['String']>
  token_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum LiquidityMiningCampaignReward_OrderBy {
  Amount = 'amount',
  Id = 'id',
  Token = 'token',
  TokenDecimals = 'token__decimals',
  TokenDerivedNativeCurrency = 'token__derivedNativeCurrency',
  TokenId = 'token__id',
  TokenName = 'token__name',
  TokenSymbol = 'token__symbol',
  TokenTotalLiquidity = 'token__totalLiquidity',
  TokenTotalSupply = 'token__totalSupply',
  TokenTradeVolume = 'token__tradeVolume',
  TokenTradeVolumeUsd = 'token__tradeVolumeUSD',
  TokenTxCount = 'token__txCount',
  TokenUntrackedVolumeUsd = 'token__untrackedVolumeUSD',
}

export type LiquidityMiningCampaign_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<LiquidityMiningCampaign_Filter>>>
  claims_?: InputMaybe<Claim_Filter>
  deposits_?: InputMaybe<Deposit_Filter>
  duration?: InputMaybe<Scalars['BigInt']>
  duration_gt?: InputMaybe<Scalars['BigInt']>
  duration_gte?: InputMaybe<Scalars['BigInt']>
  duration_in?: InputMaybe<Array<Scalars['BigInt']>>
  duration_lt?: InputMaybe<Scalars['BigInt']>
  duration_lte?: InputMaybe<Scalars['BigInt']>
  duration_not?: InputMaybe<Scalars['BigInt']>
  duration_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  endsAt?: InputMaybe<Scalars['BigInt']>
  endsAt_gt?: InputMaybe<Scalars['BigInt']>
  endsAt_gte?: InputMaybe<Scalars['BigInt']>
  endsAt_in?: InputMaybe<Array<Scalars['BigInt']>>
  endsAt_lt?: InputMaybe<Scalars['BigInt']>
  endsAt_lte?: InputMaybe<Scalars['BigInt']>
  endsAt_not?: InputMaybe<Scalars['BigInt']>
  endsAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  initialized?: InputMaybe<Scalars['Boolean']>
  initialized_in?: InputMaybe<Array<Scalars['Boolean']>>
  initialized_not?: InputMaybe<Scalars['Boolean']>
  initialized_not_in?: InputMaybe<Array<Scalars['Boolean']>>
  liquidityMiningPositionSnapshots_?: InputMaybe<LiquidityMiningPositionSnapshot_Filter>
  liquidityMiningPositions_?: InputMaybe<LiquidityMiningPosition_Filter>
  locked?: InputMaybe<Scalars['Boolean']>
  locked_in?: InputMaybe<Array<Scalars['Boolean']>>
  locked_not?: InputMaybe<Scalars['Boolean']>
  locked_not_in?: InputMaybe<Array<Scalars['Boolean']>>
  or?: InputMaybe<Array<InputMaybe<LiquidityMiningCampaign_Filter>>>
  owner?: InputMaybe<Scalars['Bytes']>
  owner_contains?: InputMaybe<Scalars['Bytes']>
  owner_gt?: InputMaybe<Scalars['Bytes']>
  owner_gte?: InputMaybe<Scalars['Bytes']>
  owner_in?: InputMaybe<Array<Scalars['Bytes']>>
  owner_lt?: InputMaybe<Scalars['Bytes']>
  owner_lte?: InputMaybe<Scalars['Bytes']>
  owner_not?: InputMaybe<Scalars['Bytes']>
  owner_not_contains?: InputMaybe<Scalars['Bytes']>
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']>>
  recoveries_?: InputMaybe<Recovery_Filter>
  rewards?: InputMaybe<Array<Scalars['String']>>
  rewards_?: InputMaybe<LiquidityMiningCampaignReward_Filter>
  rewards_contains?: InputMaybe<Array<Scalars['String']>>
  rewards_contains_nocase?: InputMaybe<Array<Scalars['String']>>
  rewards_not?: InputMaybe<Array<Scalars['String']>>
  rewards_not_contains?: InputMaybe<Array<Scalars['String']>>
  rewards_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
  stakablePair?: InputMaybe<Scalars['String']>
  stakablePair_?: InputMaybe<Pair_Filter>
  stakablePair_contains?: InputMaybe<Scalars['String']>
  stakablePair_contains_nocase?: InputMaybe<Scalars['String']>
  stakablePair_ends_with?: InputMaybe<Scalars['String']>
  stakablePair_ends_with_nocase?: InputMaybe<Scalars['String']>
  stakablePair_gt?: InputMaybe<Scalars['String']>
  stakablePair_gte?: InputMaybe<Scalars['String']>
  stakablePair_in?: InputMaybe<Array<Scalars['String']>>
  stakablePair_lt?: InputMaybe<Scalars['String']>
  stakablePair_lte?: InputMaybe<Scalars['String']>
  stakablePair_not?: InputMaybe<Scalars['String']>
  stakablePair_not_contains?: InputMaybe<Scalars['String']>
  stakablePair_not_contains_nocase?: InputMaybe<Scalars['String']>
  stakablePair_not_ends_with?: InputMaybe<Scalars['String']>
  stakablePair_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  stakablePair_not_in?: InputMaybe<Array<Scalars['String']>>
  stakablePair_not_starts_with?: InputMaybe<Scalars['String']>
  stakablePair_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  stakablePair_starts_with?: InputMaybe<Scalars['String']>
  stakablePair_starts_with_nocase?: InputMaybe<Scalars['String']>
  stakedAmount?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_gt?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_gte?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  stakedAmount_lt?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_lte?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_not?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  stakingCap?: InputMaybe<Scalars['BigDecimal']>
  stakingCap_gt?: InputMaybe<Scalars['BigDecimal']>
  stakingCap_gte?: InputMaybe<Scalars['BigDecimal']>
  stakingCap_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  stakingCap_lt?: InputMaybe<Scalars['BigDecimal']>
  stakingCap_lte?: InputMaybe<Scalars['BigDecimal']>
  stakingCap_not?: InputMaybe<Scalars['BigDecimal']>
  stakingCap_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  startsAt?: InputMaybe<Scalars['BigInt']>
  startsAt_gt?: InputMaybe<Scalars['BigInt']>
  startsAt_gte?: InputMaybe<Scalars['BigInt']>
  startsAt_in?: InputMaybe<Array<Scalars['BigInt']>>
  startsAt_lt?: InputMaybe<Scalars['BigInt']>
  startsAt_lte?: InputMaybe<Scalars['BigInt']>
  startsAt_not?: InputMaybe<Scalars['BigInt']>
  startsAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  withdrawals_?: InputMaybe<Withdrawal_Filter>
}

export enum LiquidityMiningCampaign_OrderBy {
  Claims = 'claims',
  Deposits = 'deposits',
  Duration = 'duration',
  EndsAt = 'endsAt',
  Id = 'id',
  Initialized = 'initialized',
  LiquidityMiningPositionSnapshots = 'liquidityMiningPositionSnapshots',
  LiquidityMiningPositions = 'liquidityMiningPositions',
  Locked = 'locked',
  Owner = 'owner',
  Recoveries = 'recoveries',
  Rewards = 'rewards',
  StakablePair = 'stakablePair',
  StakablePairCreatedAtBlockNumber = 'stakablePair__createdAtBlockNumber',
  StakablePairCreatedAtTimestamp = 'stakablePair__createdAtTimestamp',
  StakablePairId = 'stakablePair__id',
  StakablePairLiquidityProviderCount = 'stakablePair__liquidityProviderCount',
  StakablePairReserve0 = 'stakablePair__reserve0',
  StakablePairReserve1 = 'stakablePair__reserve1',
  StakablePairReserveNativeCurrency = 'stakablePair__reserveNativeCurrency',
  StakablePairReserveUsd = 'stakablePair__reserveUSD',
  StakablePairSwapFee = 'stakablePair__swapFee',
  StakablePairToken0Price = 'stakablePair__token0Price',
  StakablePairToken1Price = 'stakablePair__token1Price',
  StakablePairTotalSupply = 'stakablePair__totalSupply',
  StakablePairTrackedReserveNativeCurrency = 'stakablePair__trackedReserveNativeCurrency',
  StakablePairTxCount = 'stakablePair__txCount',
  StakablePairUntrackedVolumeUsd = 'stakablePair__untrackedVolumeUSD',
  StakablePairVolumeToken0 = 'stakablePair__volumeToken0',
  StakablePairVolumeToken1 = 'stakablePair__volumeToken1',
  StakablePairVolumeUsd = 'stakablePair__volumeUSD',
  StakedAmount = 'stakedAmount',
  StakingCap = 'stakingCap',
  StartsAt = 'startsAt',
  Withdrawals = 'withdrawals',
}

export type LiquidityMiningPosition = {
  __typename?: 'LiquidityMiningPosition'
  id: Scalars['ID']
  liquidityMiningCampaign: LiquidityMiningCampaign
  stakedAmount: Scalars['BigDecimal']
  targetedPair: Pair
  user: User
}

export type LiquidityMiningPositionSnapshot = {
  __typename?: 'LiquidityMiningPositionSnapshot'
  block: Scalars['Int']
  id: Scalars['ID']
  liquidityMiningCampaign: LiquidityMiningCampaign
  liquidityMiningPosition: LiquidityMiningPosition
  pair: Pair
  reserve0: Scalars['BigDecimal']
  reserve1: Scalars['BigDecimal']
  reserveUSD: Scalars['BigDecimal']
  stakedLiquidityTokenBalance: Scalars['BigDecimal']
  timestamp: Scalars['Int']
  token0PriceUSD: Scalars['BigDecimal']
  token1PriceUSD: Scalars['BigDecimal']
  totalStakedLiquidityToken: Scalars['BigDecimal']
  user: User
}

export type LiquidityMiningPositionSnapshot_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<LiquidityMiningPositionSnapshot_Filter>>>
  block?: InputMaybe<Scalars['Int']>
  block_gt?: InputMaybe<Scalars['Int']>
  block_gte?: InputMaybe<Scalars['Int']>
  block_in?: InputMaybe<Array<Scalars['Int']>>
  block_lt?: InputMaybe<Scalars['Int']>
  block_lte?: InputMaybe<Scalars['Int']>
  block_not?: InputMaybe<Scalars['Int']>
  block_not_in?: InputMaybe<Array<Scalars['Int']>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  liquidityMiningCampaign?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_?: InputMaybe<LiquidityMiningCampaign_Filter>
  liquidityMiningCampaign_contains?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_contains_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_ends_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_ends_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_gt?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_gte?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_in?: InputMaybe<Array<Scalars['String']>>
  liquidityMiningCampaign_lt?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_lte?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_contains?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_contains_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_ends_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_in?: InputMaybe<Array<Scalars['String']>>
  liquidityMiningCampaign_not_starts_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_starts_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_starts_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningPosition?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_?: InputMaybe<LiquidityMiningPosition_Filter>
  liquidityMiningPosition_contains?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_contains_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_ends_with?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_ends_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_gt?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_gte?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_in?: InputMaybe<Array<Scalars['String']>>
  liquidityMiningPosition_lt?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_lte?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_not?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_not_contains?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_not_contains_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_not_ends_with?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_not_in?: InputMaybe<Array<Scalars['String']>>
  liquidityMiningPosition_not_starts_with?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_starts_with?: InputMaybe<Scalars['String']>
  liquidityMiningPosition_starts_with_nocase?: InputMaybe<Scalars['String']>
  or?: InputMaybe<Array<InputMaybe<LiquidityMiningPositionSnapshot_Filter>>>
  pair?: InputMaybe<Scalars['String']>
  pair_?: InputMaybe<Pair_Filter>
  pair_contains?: InputMaybe<Scalars['String']>
  pair_contains_nocase?: InputMaybe<Scalars['String']>
  pair_ends_with?: InputMaybe<Scalars['String']>
  pair_ends_with_nocase?: InputMaybe<Scalars['String']>
  pair_gt?: InputMaybe<Scalars['String']>
  pair_gte?: InputMaybe<Scalars['String']>
  pair_in?: InputMaybe<Array<Scalars['String']>>
  pair_lt?: InputMaybe<Scalars['String']>
  pair_lte?: InputMaybe<Scalars['String']>
  pair_not?: InputMaybe<Scalars['String']>
  pair_not_contains?: InputMaybe<Scalars['String']>
  pair_not_contains_nocase?: InputMaybe<Scalars['String']>
  pair_not_ends_with?: InputMaybe<Scalars['String']>
  pair_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  pair_not_in?: InputMaybe<Array<Scalars['String']>>
  pair_not_starts_with?: InputMaybe<Scalars['String']>
  pair_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  pair_starts_with?: InputMaybe<Scalars['String']>
  pair_starts_with_nocase?: InputMaybe<Scalars['String']>
  reserve0?: InputMaybe<Scalars['BigDecimal']>
  reserve0_gt?: InputMaybe<Scalars['BigDecimal']>
  reserve0_gte?: InputMaybe<Scalars['BigDecimal']>
  reserve0_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserve0_lt?: InputMaybe<Scalars['BigDecimal']>
  reserve0_lte?: InputMaybe<Scalars['BigDecimal']>
  reserve0_not?: InputMaybe<Scalars['BigDecimal']>
  reserve0_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserve1?: InputMaybe<Scalars['BigDecimal']>
  reserve1_gt?: InputMaybe<Scalars['BigDecimal']>
  reserve1_gte?: InputMaybe<Scalars['BigDecimal']>
  reserve1_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserve1_lt?: InputMaybe<Scalars['BigDecimal']>
  reserve1_lte?: InputMaybe<Scalars['BigDecimal']>
  reserve1_not?: InputMaybe<Scalars['BigDecimal']>
  reserve1_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserveUSD?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserveUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_not?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  stakedLiquidityTokenBalance?: InputMaybe<Scalars['BigDecimal']>
  stakedLiquidityTokenBalance_gt?: InputMaybe<Scalars['BigDecimal']>
  stakedLiquidityTokenBalance_gte?: InputMaybe<Scalars['BigDecimal']>
  stakedLiquidityTokenBalance_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  stakedLiquidityTokenBalance_lt?: InputMaybe<Scalars['BigDecimal']>
  stakedLiquidityTokenBalance_lte?: InputMaybe<Scalars['BigDecimal']>
  stakedLiquidityTokenBalance_not?: InputMaybe<Scalars['BigDecimal']>
  stakedLiquidityTokenBalance_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  timestamp?: InputMaybe<Scalars['Int']>
  timestamp_gt?: InputMaybe<Scalars['Int']>
  timestamp_gte?: InputMaybe<Scalars['Int']>
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>
  timestamp_lt?: InputMaybe<Scalars['Int']>
  timestamp_lte?: InputMaybe<Scalars['Int']>
  timestamp_not?: InputMaybe<Scalars['Int']>
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>
  token0PriceUSD?: InputMaybe<Scalars['BigDecimal']>
  token0PriceUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  token0PriceUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  token0PriceUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  token0PriceUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  token0PriceUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  token0PriceUSD_not?: InputMaybe<Scalars['BigDecimal']>
  token0PriceUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  token1PriceUSD?: InputMaybe<Scalars['BigDecimal']>
  token1PriceUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  token1PriceUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  token1PriceUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  token1PriceUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  token1PriceUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  token1PriceUSD_not?: InputMaybe<Scalars['BigDecimal']>
  token1PriceUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalStakedLiquidityToken?: InputMaybe<Scalars['BigDecimal']>
  totalStakedLiquidityToken_gt?: InputMaybe<Scalars['BigDecimal']>
  totalStakedLiquidityToken_gte?: InputMaybe<Scalars['BigDecimal']>
  totalStakedLiquidityToken_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalStakedLiquidityToken_lt?: InputMaybe<Scalars['BigDecimal']>
  totalStakedLiquidityToken_lte?: InputMaybe<Scalars['BigDecimal']>
  totalStakedLiquidityToken_not?: InputMaybe<Scalars['BigDecimal']>
  totalStakedLiquidityToken_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  user?: InputMaybe<Scalars['String']>
  user_?: InputMaybe<User_Filter>
  user_contains?: InputMaybe<Scalars['String']>
  user_contains_nocase?: InputMaybe<Scalars['String']>
  user_ends_with?: InputMaybe<Scalars['String']>
  user_ends_with_nocase?: InputMaybe<Scalars['String']>
  user_gt?: InputMaybe<Scalars['String']>
  user_gte?: InputMaybe<Scalars['String']>
  user_in?: InputMaybe<Array<Scalars['String']>>
  user_lt?: InputMaybe<Scalars['String']>
  user_lte?: InputMaybe<Scalars['String']>
  user_not?: InputMaybe<Scalars['String']>
  user_not_contains?: InputMaybe<Scalars['String']>
  user_not_contains_nocase?: InputMaybe<Scalars['String']>
  user_not_ends_with?: InputMaybe<Scalars['String']>
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  user_not_in?: InputMaybe<Array<Scalars['String']>>
  user_not_starts_with?: InputMaybe<Scalars['String']>
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  user_starts_with?: InputMaybe<Scalars['String']>
  user_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum LiquidityMiningPositionSnapshot_OrderBy {
  Block = 'block',
  Id = 'id',
  LiquidityMiningCampaign = 'liquidityMiningCampaign',
  LiquidityMiningCampaignDuration = 'liquidityMiningCampaign__duration',
  LiquidityMiningCampaignEndsAt = 'liquidityMiningCampaign__endsAt',
  LiquidityMiningCampaignId = 'liquidityMiningCampaign__id',
  LiquidityMiningCampaignInitialized = 'liquidityMiningCampaign__initialized',
  LiquidityMiningCampaignLocked = 'liquidityMiningCampaign__locked',
  LiquidityMiningCampaignOwner = 'liquidityMiningCampaign__owner',
  LiquidityMiningCampaignStakedAmount = 'liquidityMiningCampaign__stakedAmount',
  LiquidityMiningCampaignStakingCap = 'liquidityMiningCampaign__stakingCap',
  LiquidityMiningCampaignStartsAt = 'liquidityMiningCampaign__startsAt',
  LiquidityMiningPosition = 'liquidityMiningPosition',
  LiquidityMiningPositionId = 'liquidityMiningPosition__id',
  LiquidityMiningPositionStakedAmount = 'liquidityMiningPosition__stakedAmount',
  Pair = 'pair',
  PairCreatedAtBlockNumber = 'pair__createdAtBlockNumber',
  PairCreatedAtTimestamp = 'pair__createdAtTimestamp',
  PairId = 'pair__id',
  PairLiquidityProviderCount = 'pair__liquidityProviderCount',
  PairReserve0 = 'pair__reserve0',
  PairReserve1 = 'pair__reserve1',
  PairReserveNativeCurrency = 'pair__reserveNativeCurrency',
  PairReserveUsd = 'pair__reserveUSD',
  PairSwapFee = 'pair__swapFee',
  PairToken0Price = 'pair__token0Price',
  PairToken1Price = 'pair__token1Price',
  PairTotalSupply = 'pair__totalSupply',
  PairTrackedReserveNativeCurrency = 'pair__trackedReserveNativeCurrency',
  PairTxCount = 'pair__txCount',
  PairUntrackedVolumeUsd = 'pair__untrackedVolumeUSD',
  PairVolumeToken0 = 'pair__volumeToken0',
  PairVolumeToken1 = 'pair__volumeToken1',
  PairVolumeUsd = 'pair__volumeUSD',
  Reserve0 = 'reserve0',
  Reserve1 = 'reserve1',
  ReserveUsd = 'reserveUSD',
  StakedLiquidityTokenBalance = 'stakedLiquidityTokenBalance',
  Timestamp = 'timestamp',
  Token0PriceUsd = 'token0PriceUSD',
  Token1PriceUsd = 'token1PriceUSD',
  TotalStakedLiquidityToken = 'totalStakedLiquidityToken',
  User = 'user',
  UserId = 'user__id',
  UserUsdSwapped = 'user__usdSwapped',
}

export type LiquidityMiningPosition_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<LiquidityMiningPosition_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  liquidityMiningCampaign?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_?: InputMaybe<LiquidityMiningCampaign_Filter>
  liquidityMiningCampaign_contains?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_contains_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_ends_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_ends_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_gt?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_gte?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_in?: InputMaybe<Array<Scalars['String']>>
  liquidityMiningCampaign_lt?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_lte?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_contains?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_contains_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_ends_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_in?: InputMaybe<Array<Scalars['String']>>
  liquidityMiningCampaign_not_starts_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_starts_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_starts_with_nocase?: InputMaybe<Scalars['String']>
  or?: InputMaybe<Array<InputMaybe<LiquidityMiningPosition_Filter>>>
  stakedAmount?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_gt?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_gte?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  stakedAmount_lt?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_lte?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_not?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  targetedPair?: InputMaybe<Scalars['String']>
  targetedPair_?: InputMaybe<Pair_Filter>
  targetedPair_contains?: InputMaybe<Scalars['String']>
  targetedPair_contains_nocase?: InputMaybe<Scalars['String']>
  targetedPair_ends_with?: InputMaybe<Scalars['String']>
  targetedPair_ends_with_nocase?: InputMaybe<Scalars['String']>
  targetedPair_gt?: InputMaybe<Scalars['String']>
  targetedPair_gte?: InputMaybe<Scalars['String']>
  targetedPair_in?: InputMaybe<Array<Scalars['String']>>
  targetedPair_lt?: InputMaybe<Scalars['String']>
  targetedPair_lte?: InputMaybe<Scalars['String']>
  targetedPair_not?: InputMaybe<Scalars['String']>
  targetedPair_not_contains?: InputMaybe<Scalars['String']>
  targetedPair_not_contains_nocase?: InputMaybe<Scalars['String']>
  targetedPair_not_ends_with?: InputMaybe<Scalars['String']>
  targetedPair_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  targetedPair_not_in?: InputMaybe<Array<Scalars['String']>>
  targetedPair_not_starts_with?: InputMaybe<Scalars['String']>
  targetedPair_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  targetedPair_starts_with?: InputMaybe<Scalars['String']>
  targetedPair_starts_with_nocase?: InputMaybe<Scalars['String']>
  user?: InputMaybe<Scalars['String']>
  user_?: InputMaybe<User_Filter>
  user_contains?: InputMaybe<Scalars['String']>
  user_contains_nocase?: InputMaybe<Scalars['String']>
  user_ends_with?: InputMaybe<Scalars['String']>
  user_ends_with_nocase?: InputMaybe<Scalars['String']>
  user_gt?: InputMaybe<Scalars['String']>
  user_gte?: InputMaybe<Scalars['String']>
  user_in?: InputMaybe<Array<Scalars['String']>>
  user_lt?: InputMaybe<Scalars['String']>
  user_lte?: InputMaybe<Scalars['String']>
  user_not?: InputMaybe<Scalars['String']>
  user_not_contains?: InputMaybe<Scalars['String']>
  user_not_contains_nocase?: InputMaybe<Scalars['String']>
  user_not_ends_with?: InputMaybe<Scalars['String']>
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  user_not_in?: InputMaybe<Array<Scalars['String']>>
  user_not_starts_with?: InputMaybe<Scalars['String']>
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  user_starts_with?: InputMaybe<Scalars['String']>
  user_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum LiquidityMiningPosition_OrderBy {
  Id = 'id',
  LiquidityMiningCampaign = 'liquidityMiningCampaign',
  LiquidityMiningCampaignDuration = 'liquidityMiningCampaign__duration',
  LiquidityMiningCampaignEndsAt = 'liquidityMiningCampaign__endsAt',
  LiquidityMiningCampaignId = 'liquidityMiningCampaign__id',
  LiquidityMiningCampaignInitialized = 'liquidityMiningCampaign__initialized',
  LiquidityMiningCampaignLocked = 'liquidityMiningCampaign__locked',
  LiquidityMiningCampaignOwner = 'liquidityMiningCampaign__owner',
  LiquidityMiningCampaignStakedAmount = 'liquidityMiningCampaign__stakedAmount',
  LiquidityMiningCampaignStakingCap = 'liquidityMiningCampaign__stakingCap',
  LiquidityMiningCampaignStartsAt = 'liquidityMiningCampaign__startsAt',
  StakedAmount = 'stakedAmount',
  TargetedPair = 'targetedPair',
  TargetedPairCreatedAtBlockNumber = 'targetedPair__createdAtBlockNumber',
  TargetedPairCreatedAtTimestamp = 'targetedPair__createdAtTimestamp',
  TargetedPairId = 'targetedPair__id',
  TargetedPairLiquidityProviderCount = 'targetedPair__liquidityProviderCount',
  TargetedPairReserve0 = 'targetedPair__reserve0',
  TargetedPairReserve1 = 'targetedPair__reserve1',
  TargetedPairReserveNativeCurrency = 'targetedPair__reserveNativeCurrency',
  TargetedPairReserveUsd = 'targetedPair__reserveUSD',
  TargetedPairSwapFee = 'targetedPair__swapFee',
  TargetedPairToken0Price = 'targetedPair__token0Price',
  TargetedPairToken1Price = 'targetedPair__token1Price',
  TargetedPairTotalSupply = 'targetedPair__totalSupply',
  TargetedPairTrackedReserveNativeCurrency = 'targetedPair__trackedReserveNativeCurrency',
  TargetedPairTxCount = 'targetedPair__txCount',
  TargetedPairUntrackedVolumeUsd = 'targetedPair__untrackedVolumeUSD',
  TargetedPairVolumeToken0 = 'targetedPair__volumeToken0',
  TargetedPairVolumeToken1 = 'targetedPair__volumeToken1',
  TargetedPairVolumeUsd = 'targetedPair__volumeUSD',
  User = 'user',
  UserId = 'user__id',
  UserUsdSwapped = 'user__usdSwapped',
}

export type LiquidityPosition = {
  __typename?: 'LiquidityPosition'
  id: Scalars['ID']
  liquidityTokenBalance: Scalars['BigDecimal']
  pair: Pair
  user: User
}

export type LiquidityPositionSnapshot = {
  __typename?: 'LiquidityPositionSnapshot'
  block: Scalars['Int']
  id: Scalars['ID']
  liquidityPosition: LiquidityPosition
  liquidityTokenBalance: Scalars['BigDecimal']
  liquidityTokenTotalSupply: Scalars['BigDecimal']
  pair: Pair
  reserve0: Scalars['BigDecimal']
  reserve1: Scalars['BigDecimal']
  reserveUSD: Scalars['BigDecimal']
  timestamp: Scalars['Int']
  token0PriceUSD: Scalars['BigDecimal']
  token1PriceUSD: Scalars['BigDecimal']
  user: User
}

export type LiquidityPositionSnapshot_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<LiquidityPositionSnapshot_Filter>>>
  block?: InputMaybe<Scalars['Int']>
  block_gt?: InputMaybe<Scalars['Int']>
  block_gte?: InputMaybe<Scalars['Int']>
  block_in?: InputMaybe<Array<Scalars['Int']>>
  block_lt?: InputMaybe<Scalars['Int']>
  block_lte?: InputMaybe<Scalars['Int']>
  block_not?: InputMaybe<Scalars['Int']>
  block_not_in?: InputMaybe<Array<Scalars['Int']>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  liquidityPosition?: InputMaybe<Scalars['String']>
  liquidityPosition_?: InputMaybe<LiquidityPosition_Filter>
  liquidityPosition_contains?: InputMaybe<Scalars['String']>
  liquidityPosition_contains_nocase?: InputMaybe<Scalars['String']>
  liquidityPosition_ends_with?: InputMaybe<Scalars['String']>
  liquidityPosition_ends_with_nocase?: InputMaybe<Scalars['String']>
  liquidityPosition_gt?: InputMaybe<Scalars['String']>
  liquidityPosition_gte?: InputMaybe<Scalars['String']>
  liquidityPosition_in?: InputMaybe<Array<Scalars['String']>>
  liquidityPosition_lt?: InputMaybe<Scalars['String']>
  liquidityPosition_lte?: InputMaybe<Scalars['String']>
  liquidityPosition_not?: InputMaybe<Scalars['String']>
  liquidityPosition_not_contains?: InputMaybe<Scalars['String']>
  liquidityPosition_not_contains_nocase?: InputMaybe<Scalars['String']>
  liquidityPosition_not_ends_with?: InputMaybe<Scalars['String']>
  liquidityPosition_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  liquidityPosition_not_in?: InputMaybe<Array<Scalars['String']>>
  liquidityPosition_not_starts_with?: InputMaybe<Scalars['String']>
  liquidityPosition_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  liquidityPosition_starts_with?: InputMaybe<Scalars['String']>
  liquidityPosition_starts_with_nocase?: InputMaybe<Scalars['String']>
  liquidityTokenBalance?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenBalance_gt?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenBalance_gte?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenBalance_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  liquidityTokenBalance_lt?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenBalance_lte?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenBalance_not?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenBalance_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  liquidityTokenTotalSupply?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenTotalSupply_gt?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenTotalSupply_gte?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenTotalSupply_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  liquidityTokenTotalSupply_lt?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenTotalSupply_lte?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenTotalSupply_not?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenTotalSupply_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  or?: InputMaybe<Array<InputMaybe<LiquidityPositionSnapshot_Filter>>>
  pair?: InputMaybe<Scalars['String']>
  pair_?: InputMaybe<Pair_Filter>
  pair_contains?: InputMaybe<Scalars['String']>
  pair_contains_nocase?: InputMaybe<Scalars['String']>
  pair_ends_with?: InputMaybe<Scalars['String']>
  pair_ends_with_nocase?: InputMaybe<Scalars['String']>
  pair_gt?: InputMaybe<Scalars['String']>
  pair_gte?: InputMaybe<Scalars['String']>
  pair_in?: InputMaybe<Array<Scalars['String']>>
  pair_lt?: InputMaybe<Scalars['String']>
  pair_lte?: InputMaybe<Scalars['String']>
  pair_not?: InputMaybe<Scalars['String']>
  pair_not_contains?: InputMaybe<Scalars['String']>
  pair_not_contains_nocase?: InputMaybe<Scalars['String']>
  pair_not_ends_with?: InputMaybe<Scalars['String']>
  pair_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  pair_not_in?: InputMaybe<Array<Scalars['String']>>
  pair_not_starts_with?: InputMaybe<Scalars['String']>
  pair_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  pair_starts_with?: InputMaybe<Scalars['String']>
  pair_starts_with_nocase?: InputMaybe<Scalars['String']>
  reserve0?: InputMaybe<Scalars['BigDecimal']>
  reserve0_gt?: InputMaybe<Scalars['BigDecimal']>
  reserve0_gte?: InputMaybe<Scalars['BigDecimal']>
  reserve0_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserve0_lt?: InputMaybe<Scalars['BigDecimal']>
  reserve0_lte?: InputMaybe<Scalars['BigDecimal']>
  reserve0_not?: InputMaybe<Scalars['BigDecimal']>
  reserve0_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserve1?: InputMaybe<Scalars['BigDecimal']>
  reserve1_gt?: InputMaybe<Scalars['BigDecimal']>
  reserve1_gte?: InputMaybe<Scalars['BigDecimal']>
  reserve1_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserve1_lt?: InputMaybe<Scalars['BigDecimal']>
  reserve1_lte?: InputMaybe<Scalars['BigDecimal']>
  reserve1_not?: InputMaybe<Scalars['BigDecimal']>
  reserve1_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserveUSD?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserveUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_not?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  timestamp?: InputMaybe<Scalars['Int']>
  timestamp_gt?: InputMaybe<Scalars['Int']>
  timestamp_gte?: InputMaybe<Scalars['Int']>
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>
  timestamp_lt?: InputMaybe<Scalars['Int']>
  timestamp_lte?: InputMaybe<Scalars['Int']>
  timestamp_not?: InputMaybe<Scalars['Int']>
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>
  token0PriceUSD?: InputMaybe<Scalars['BigDecimal']>
  token0PriceUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  token0PriceUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  token0PriceUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  token0PriceUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  token0PriceUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  token0PriceUSD_not?: InputMaybe<Scalars['BigDecimal']>
  token0PriceUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  token1PriceUSD?: InputMaybe<Scalars['BigDecimal']>
  token1PriceUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  token1PriceUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  token1PriceUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  token1PriceUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  token1PriceUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  token1PriceUSD_not?: InputMaybe<Scalars['BigDecimal']>
  token1PriceUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  user?: InputMaybe<Scalars['String']>
  user_?: InputMaybe<User_Filter>
  user_contains?: InputMaybe<Scalars['String']>
  user_contains_nocase?: InputMaybe<Scalars['String']>
  user_ends_with?: InputMaybe<Scalars['String']>
  user_ends_with_nocase?: InputMaybe<Scalars['String']>
  user_gt?: InputMaybe<Scalars['String']>
  user_gte?: InputMaybe<Scalars['String']>
  user_in?: InputMaybe<Array<Scalars['String']>>
  user_lt?: InputMaybe<Scalars['String']>
  user_lte?: InputMaybe<Scalars['String']>
  user_not?: InputMaybe<Scalars['String']>
  user_not_contains?: InputMaybe<Scalars['String']>
  user_not_contains_nocase?: InputMaybe<Scalars['String']>
  user_not_ends_with?: InputMaybe<Scalars['String']>
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  user_not_in?: InputMaybe<Array<Scalars['String']>>
  user_not_starts_with?: InputMaybe<Scalars['String']>
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  user_starts_with?: InputMaybe<Scalars['String']>
  user_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum LiquidityPositionSnapshot_OrderBy {
  Block = 'block',
  Id = 'id',
  LiquidityPosition = 'liquidityPosition',
  LiquidityPositionId = 'liquidityPosition__id',
  LiquidityPositionLiquidityTokenBalance = 'liquidityPosition__liquidityTokenBalance',
  LiquidityTokenBalance = 'liquidityTokenBalance',
  LiquidityTokenTotalSupply = 'liquidityTokenTotalSupply',
  Pair = 'pair',
  PairCreatedAtBlockNumber = 'pair__createdAtBlockNumber',
  PairCreatedAtTimestamp = 'pair__createdAtTimestamp',
  PairId = 'pair__id',
  PairLiquidityProviderCount = 'pair__liquidityProviderCount',
  PairReserve0 = 'pair__reserve0',
  PairReserve1 = 'pair__reserve1',
  PairReserveNativeCurrency = 'pair__reserveNativeCurrency',
  PairReserveUsd = 'pair__reserveUSD',
  PairSwapFee = 'pair__swapFee',
  PairToken0Price = 'pair__token0Price',
  PairToken1Price = 'pair__token1Price',
  PairTotalSupply = 'pair__totalSupply',
  PairTrackedReserveNativeCurrency = 'pair__trackedReserveNativeCurrency',
  PairTxCount = 'pair__txCount',
  PairUntrackedVolumeUsd = 'pair__untrackedVolumeUSD',
  PairVolumeToken0 = 'pair__volumeToken0',
  PairVolumeToken1 = 'pair__volumeToken1',
  PairVolumeUsd = 'pair__volumeUSD',
  Reserve0 = 'reserve0',
  Reserve1 = 'reserve1',
  ReserveUsd = 'reserveUSD',
  Timestamp = 'timestamp',
  Token0PriceUsd = 'token0PriceUSD',
  Token1PriceUsd = 'token1PriceUSD',
  User = 'user',
  UserId = 'user__id',
  UserUsdSwapped = 'user__usdSwapped',
}

export type LiquidityPosition_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<LiquidityPosition_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  liquidityTokenBalance?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenBalance_gt?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenBalance_gte?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenBalance_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  liquidityTokenBalance_lt?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenBalance_lte?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenBalance_not?: InputMaybe<Scalars['BigDecimal']>
  liquidityTokenBalance_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  or?: InputMaybe<Array<InputMaybe<LiquidityPosition_Filter>>>
  pair?: InputMaybe<Scalars['String']>
  pair_?: InputMaybe<Pair_Filter>
  pair_contains?: InputMaybe<Scalars['String']>
  pair_contains_nocase?: InputMaybe<Scalars['String']>
  pair_ends_with?: InputMaybe<Scalars['String']>
  pair_ends_with_nocase?: InputMaybe<Scalars['String']>
  pair_gt?: InputMaybe<Scalars['String']>
  pair_gte?: InputMaybe<Scalars['String']>
  pair_in?: InputMaybe<Array<Scalars['String']>>
  pair_lt?: InputMaybe<Scalars['String']>
  pair_lte?: InputMaybe<Scalars['String']>
  pair_not?: InputMaybe<Scalars['String']>
  pair_not_contains?: InputMaybe<Scalars['String']>
  pair_not_contains_nocase?: InputMaybe<Scalars['String']>
  pair_not_ends_with?: InputMaybe<Scalars['String']>
  pair_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  pair_not_in?: InputMaybe<Array<Scalars['String']>>
  pair_not_starts_with?: InputMaybe<Scalars['String']>
  pair_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  pair_starts_with?: InputMaybe<Scalars['String']>
  pair_starts_with_nocase?: InputMaybe<Scalars['String']>
  user?: InputMaybe<Scalars['String']>
  user_?: InputMaybe<User_Filter>
  user_contains?: InputMaybe<Scalars['String']>
  user_contains_nocase?: InputMaybe<Scalars['String']>
  user_ends_with?: InputMaybe<Scalars['String']>
  user_ends_with_nocase?: InputMaybe<Scalars['String']>
  user_gt?: InputMaybe<Scalars['String']>
  user_gte?: InputMaybe<Scalars['String']>
  user_in?: InputMaybe<Array<Scalars['String']>>
  user_lt?: InputMaybe<Scalars['String']>
  user_lte?: InputMaybe<Scalars['String']>
  user_not?: InputMaybe<Scalars['String']>
  user_not_contains?: InputMaybe<Scalars['String']>
  user_not_contains_nocase?: InputMaybe<Scalars['String']>
  user_not_ends_with?: InputMaybe<Scalars['String']>
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  user_not_in?: InputMaybe<Array<Scalars['String']>>
  user_not_starts_with?: InputMaybe<Scalars['String']>
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  user_starts_with?: InputMaybe<Scalars['String']>
  user_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum LiquidityPosition_OrderBy {
  Id = 'id',
  LiquidityTokenBalance = 'liquidityTokenBalance',
  Pair = 'pair',
  PairCreatedAtBlockNumber = 'pair__createdAtBlockNumber',
  PairCreatedAtTimestamp = 'pair__createdAtTimestamp',
  PairId = 'pair__id',
  PairLiquidityProviderCount = 'pair__liquidityProviderCount',
  PairReserve0 = 'pair__reserve0',
  PairReserve1 = 'pair__reserve1',
  PairReserveNativeCurrency = 'pair__reserveNativeCurrency',
  PairReserveUsd = 'pair__reserveUSD',
  PairSwapFee = 'pair__swapFee',
  PairToken0Price = 'pair__token0Price',
  PairToken1Price = 'pair__token1Price',
  PairTotalSupply = 'pair__totalSupply',
  PairTrackedReserveNativeCurrency = 'pair__trackedReserveNativeCurrency',
  PairTxCount = 'pair__txCount',
  PairUntrackedVolumeUsd = 'pair__untrackedVolumeUSD',
  PairVolumeToken0 = 'pair__volumeToken0',
  PairVolumeToken1 = 'pair__volumeToken1',
  PairVolumeUsd = 'pair__volumeUSD',
  User = 'user',
  UserId = 'user__id',
  UserUsdSwapped = 'user__usdSwapped',
}

export type Mint = {
  __typename?: 'Mint'
  amount0?: Maybe<Scalars['BigDecimal']>
  amount1?: Maybe<Scalars['BigDecimal']>
  amountUSD?: Maybe<Scalars['BigDecimal']>
  feeLiquidity?: Maybe<Scalars['BigDecimal']>
  feeTo?: Maybe<Scalars['Bytes']>
  id: Scalars['ID']
  liquidity: Scalars['BigDecimal']
  logIndex?: Maybe<Scalars['BigInt']>
  pair: Pair
  sender?: Maybe<Scalars['Bytes']>
  timestamp: Scalars['BigInt']
  to: Scalars['Bytes']
  transaction: Transaction
}

export type Mint_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  amount0?: InputMaybe<Scalars['BigDecimal']>
  amount0_gt?: InputMaybe<Scalars['BigDecimal']>
  amount0_gte?: InputMaybe<Scalars['BigDecimal']>
  amount0_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount0_lt?: InputMaybe<Scalars['BigDecimal']>
  amount0_lte?: InputMaybe<Scalars['BigDecimal']>
  amount0_not?: InputMaybe<Scalars['BigDecimal']>
  amount0_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount1?: InputMaybe<Scalars['BigDecimal']>
  amount1_gt?: InputMaybe<Scalars['BigDecimal']>
  amount1_gte?: InputMaybe<Scalars['BigDecimal']>
  amount1_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount1_lt?: InputMaybe<Scalars['BigDecimal']>
  amount1_lte?: InputMaybe<Scalars['BigDecimal']>
  amount1_not?: InputMaybe<Scalars['BigDecimal']>
  amount1_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amountUSD?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amountUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_not?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  and?: InputMaybe<Array<InputMaybe<Mint_Filter>>>
  feeLiquidity?: InputMaybe<Scalars['BigDecimal']>
  feeLiquidity_gt?: InputMaybe<Scalars['BigDecimal']>
  feeLiquidity_gte?: InputMaybe<Scalars['BigDecimal']>
  feeLiquidity_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  feeLiquidity_lt?: InputMaybe<Scalars['BigDecimal']>
  feeLiquidity_lte?: InputMaybe<Scalars['BigDecimal']>
  feeLiquidity_not?: InputMaybe<Scalars['BigDecimal']>
  feeLiquidity_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  feeTo?: InputMaybe<Scalars['Bytes']>
  feeTo_contains?: InputMaybe<Scalars['Bytes']>
  feeTo_gt?: InputMaybe<Scalars['Bytes']>
  feeTo_gte?: InputMaybe<Scalars['Bytes']>
  feeTo_in?: InputMaybe<Array<Scalars['Bytes']>>
  feeTo_lt?: InputMaybe<Scalars['Bytes']>
  feeTo_lte?: InputMaybe<Scalars['Bytes']>
  feeTo_not?: InputMaybe<Scalars['Bytes']>
  feeTo_not_contains?: InputMaybe<Scalars['Bytes']>
  feeTo_not_in?: InputMaybe<Array<Scalars['Bytes']>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  liquidity?: InputMaybe<Scalars['BigDecimal']>
  liquidity_gt?: InputMaybe<Scalars['BigDecimal']>
  liquidity_gte?: InputMaybe<Scalars['BigDecimal']>
  liquidity_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  liquidity_lt?: InputMaybe<Scalars['BigDecimal']>
  liquidity_lte?: InputMaybe<Scalars['BigDecimal']>
  liquidity_not?: InputMaybe<Scalars['BigDecimal']>
  liquidity_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  logIndex?: InputMaybe<Scalars['BigInt']>
  logIndex_gt?: InputMaybe<Scalars['BigInt']>
  logIndex_gte?: InputMaybe<Scalars['BigInt']>
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>
  logIndex_lt?: InputMaybe<Scalars['BigInt']>
  logIndex_lte?: InputMaybe<Scalars['BigInt']>
  logIndex_not?: InputMaybe<Scalars['BigInt']>
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  or?: InputMaybe<Array<InputMaybe<Mint_Filter>>>
  pair?: InputMaybe<Scalars['String']>
  pair_?: InputMaybe<Pair_Filter>
  pair_contains?: InputMaybe<Scalars['String']>
  pair_contains_nocase?: InputMaybe<Scalars['String']>
  pair_ends_with?: InputMaybe<Scalars['String']>
  pair_ends_with_nocase?: InputMaybe<Scalars['String']>
  pair_gt?: InputMaybe<Scalars['String']>
  pair_gte?: InputMaybe<Scalars['String']>
  pair_in?: InputMaybe<Array<Scalars['String']>>
  pair_lt?: InputMaybe<Scalars['String']>
  pair_lte?: InputMaybe<Scalars['String']>
  pair_not?: InputMaybe<Scalars['String']>
  pair_not_contains?: InputMaybe<Scalars['String']>
  pair_not_contains_nocase?: InputMaybe<Scalars['String']>
  pair_not_ends_with?: InputMaybe<Scalars['String']>
  pair_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  pair_not_in?: InputMaybe<Array<Scalars['String']>>
  pair_not_starts_with?: InputMaybe<Scalars['String']>
  pair_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  pair_starts_with?: InputMaybe<Scalars['String']>
  pair_starts_with_nocase?: InputMaybe<Scalars['String']>
  sender?: InputMaybe<Scalars['Bytes']>
  sender_contains?: InputMaybe<Scalars['Bytes']>
  sender_gt?: InputMaybe<Scalars['Bytes']>
  sender_gte?: InputMaybe<Scalars['Bytes']>
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>
  sender_lt?: InputMaybe<Scalars['Bytes']>
  sender_lte?: InputMaybe<Scalars['Bytes']>
  sender_not?: InputMaybe<Scalars['Bytes']>
  sender_not_contains?: InputMaybe<Scalars['Bytes']>
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>
  timestamp?: InputMaybe<Scalars['BigInt']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']>
  timestamp_not?: InputMaybe<Scalars['BigInt']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  to?: InputMaybe<Scalars['Bytes']>
  to_contains?: InputMaybe<Scalars['Bytes']>
  to_gt?: InputMaybe<Scalars['Bytes']>
  to_gte?: InputMaybe<Scalars['Bytes']>
  to_in?: InputMaybe<Array<Scalars['Bytes']>>
  to_lt?: InputMaybe<Scalars['Bytes']>
  to_lte?: InputMaybe<Scalars['Bytes']>
  to_not?: InputMaybe<Scalars['Bytes']>
  to_not_contains?: InputMaybe<Scalars['Bytes']>
  to_not_in?: InputMaybe<Array<Scalars['Bytes']>>
  transaction?: InputMaybe<Scalars['String']>
  transaction_?: InputMaybe<Transaction_Filter>
  transaction_contains?: InputMaybe<Scalars['String']>
  transaction_contains_nocase?: InputMaybe<Scalars['String']>
  transaction_ends_with?: InputMaybe<Scalars['String']>
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']>
  transaction_gt?: InputMaybe<Scalars['String']>
  transaction_gte?: InputMaybe<Scalars['String']>
  transaction_in?: InputMaybe<Array<Scalars['String']>>
  transaction_lt?: InputMaybe<Scalars['String']>
  transaction_lte?: InputMaybe<Scalars['String']>
  transaction_not?: InputMaybe<Scalars['String']>
  transaction_not_contains?: InputMaybe<Scalars['String']>
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']>
  transaction_not_ends_with?: InputMaybe<Scalars['String']>
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  transaction_not_in?: InputMaybe<Array<Scalars['String']>>
  transaction_not_starts_with?: InputMaybe<Scalars['String']>
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  transaction_starts_with?: InputMaybe<Scalars['String']>
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum Mint_OrderBy {
  Amount0 = 'amount0',
  Amount1 = 'amount1',
  AmountUsd = 'amountUSD',
  FeeLiquidity = 'feeLiquidity',
  FeeTo = 'feeTo',
  Id = 'id',
  Liquidity = 'liquidity',
  LogIndex = 'logIndex',
  Pair = 'pair',
  PairCreatedAtBlockNumber = 'pair__createdAtBlockNumber',
  PairCreatedAtTimestamp = 'pair__createdAtTimestamp',
  PairId = 'pair__id',
  PairLiquidityProviderCount = 'pair__liquidityProviderCount',
  PairReserve0 = 'pair__reserve0',
  PairReserve1 = 'pair__reserve1',
  PairReserveNativeCurrency = 'pair__reserveNativeCurrency',
  PairReserveUsd = 'pair__reserveUSD',
  PairSwapFee = 'pair__swapFee',
  PairToken0Price = 'pair__token0Price',
  PairToken1Price = 'pair__token1Price',
  PairTotalSupply = 'pair__totalSupply',
  PairTrackedReserveNativeCurrency = 'pair__trackedReserveNativeCurrency',
  PairTxCount = 'pair__txCount',
  PairUntrackedVolumeUsd = 'pair__untrackedVolumeUSD',
  PairVolumeToken0 = 'pair__volumeToken0',
  PairVolumeToken1 = 'pair__volumeToken1',
  PairVolumeUsd = 'pair__volumeUSD',
  Sender = 'sender',
  Timestamp = 'timestamp',
  To = 'to',
  Transaction = 'transaction',
  TransactionBlockNumber = 'transaction__blockNumber',
  TransactionId = 'transaction__id',
  TransactionTimestamp = 'transaction__timestamp',
}

export type MonthlyUniqueAddressInteraction = {
  __typename?: 'MonthlyUniqueAddressInteraction'
  addresses: Array<Scalars['Bytes']>
  id: Scalars['ID']
  timestamp: Scalars['Int']
}

export type MonthlyUniqueAddressInteraction_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  addresses?: InputMaybe<Array<Scalars['Bytes']>>
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>
  and?: InputMaybe<Array<InputMaybe<MonthlyUniqueAddressInteraction_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  or?: InputMaybe<Array<InputMaybe<MonthlyUniqueAddressInteraction_Filter>>>
  timestamp?: InputMaybe<Scalars['Int']>
  timestamp_gt?: InputMaybe<Scalars['Int']>
  timestamp_gte?: InputMaybe<Scalars['Int']>
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>
  timestamp_lt?: InputMaybe<Scalars['Int']>
  timestamp_lte?: InputMaybe<Scalars['Int']>
  timestamp_not?: InputMaybe<Scalars['Int']>
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>
}

export enum MonthlyUniqueAddressInteraction_OrderBy {
  Addresses = 'addresses',
  Id = 'id',
  Timestamp = 'timestamp',
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export type Pair = {
  __typename?: 'Pair'
  burns: Array<Burn>
  createdAtBlockNumber: Scalars['BigInt']
  createdAtTimestamp: Scalars['BigInt']
  id: Scalars['ID']
  liquidityMiningCampaigns: Array<LiquidityMiningCampaign>
  liquidityPositionSnapshots: Array<LiquidityPositionSnapshot>
  liquidityPositions: Array<LiquidityPosition>
  liquidityProviderCount: Scalars['BigInt']
  mints: Array<Mint>
  pairHourData: Array<PairHourData>
  reserve0: Scalars['BigDecimal']
  reserve1: Scalars['BigDecimal']
  reserveNativeCurrency: Scalars['BigDecimal']
  reserveUSD: Scalars['BigDecimal']
  swapFee: Scalars['BigInt']
  swaps: Array<Swap>
  token0: Token
  token0Price: Scalars['BigDecimal']
  token1: Token
  token1Price: Scalars['BigDecimal']
  totalSupply: Scalars['BigDecimal']
  trackedReserveNativeCurrency: Scalars['BigDecimal']
  txCount: Scalars['BigInt']
  untrackedVolumeUSD: Scalars['BigDecimal']
  volumeToken0: Scalars['BigDecimal']
  volumeToken1: Scalars['BigDecimal']
  volumeUSD: Scalars['BigDecimal']
}

export type PairBurnsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Burn_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<Burn_Filter>
}

export type PairLiquidityMiningCampaignsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityMiningCampaign_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<LiquidityMiningCampaign_Filter>
}

export type PairLiquidityPositionSnapshotsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityPositionSnapshot_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<LiquidityPositionSnapshot_Filter>
}

export type PairLiquidityPositionsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityPosition_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<LiquidityPosition_Filter>
}

export type PairMintsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Mint_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<Mint_Filter>
}

export type PairPairHourDataArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<PairHourData_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<PairHourData_Filter>
}

export type PairSwapsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Swap_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<Swap_Filter>
}

export type PairDayData = {
  __typename?: 'PairDayData'
  dailyTxns: Scalars['BigInt']
  dailyVolumeToken0: Scalars['BigDecimal']
  dailyVolumeToken1: Scalars['BigDecimal']
  dailyVolumeUSD: Scalars['BigDecimal']
  date: Scalars['Int']
  id: Scalars['ID']
  pairAddress: Scalars['Bytes']
  reserve0: Scalars['BigDecimal']
  reserve1: Scalars['BigDecimal']
  reserveUSD: Scalars['BigDecimal']
  token0: Token
  token1: Token
  totalSupply: Scalars['BigDecimal']
}

export type PairDayData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<PairDayData_Filter>>>
  dailyTxns?: InputMaybe<Scalars['BigInt']>
  dailyTxns_gt?: InputMaybe<Scalars['BigInt']>
  dailyTxns_gte?: InputMaybe<Scalars['BigInt']>
  dailyTxns_in?: InputMaybe<Array<Scalars['BigInt']>>
  dailyTxns_lt?: InputMaybe<Scalars['BigInt']>
  dailyTxns_lte?: InputMaybe<Scalars['BigInt']>
  dailyTxns_not?: InputMaybe<Scalars['BigInt']>
  dailyTxns_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  dailyVolumeToken0?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken0_gt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken0_gte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken0_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  dailyVolumeToken0_lt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken0_lte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken0_not?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  dailyVolumeToken1?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken1_gt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken1_gte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken1_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  dailyVolumeToken1_lt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken1_lte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken1_not?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  dailyVolumeUSD?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  dailyVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  date?: InputMaybe<Scalars['Int']>
  date_gt?: InputMaybe<Scalars['Int']>
  date_gte?: InputMaybe<Scalars['Int']>
  date_in?: InputMaybe<Array<Scalars['Int']>>
  date_lt?: InputMaybe<Scalars['Int']>
  date_lte?: InputMaybe<Scalars['Int']>
  date_not?: InputMaybe<Scalars['Int']>
  date_not_in?: InputMaybe<Array<Scalars['Int']>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  or?: InputMaybe<Array<InputMaybe<PairDayData_Filter>>>
  pairAddress?: InputMaybe<Scalars['Bytes']>
  pairAddress_contains?: InputMaybe<Scalars['Bytes']>
  pairAddress_gt?: InputMaybe<Scalars['Bytes']>
  pairAddress_gte?: InputMaybe<Scalars['Bytes']>
  pairAddress_in?: InputMaybe<Array<Scalars['Bytes']>>
  pairAddress_lt?: InputMaybe<Scalars['Bytes']>
  pairAddress_lte?: InputMaybe<Scalars['Bytes']>
  pairAddress_not?: InputMaybe<Scalars['Bytes']>
  pairAddress_not_contains?: InputMaybe<Scalars['Bytes']>
  pairAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>
  reserve0?: InputMaybe<Scalars['BigDecimal']>
  reserve0_gt?: InputMaybe<Scalars['BigDecimal']>
  reserve0_gte?: InputMaybe<Scalars['BigDecimal']>
  reserve0_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserve0_lt?: InputMaybe<Scalars['BigDecimal']>
  reserve0_lte?: InputMaybe<Scalars['BigDecimal']>
  reserve0_not?: InputMaybe<Scalars['BigDecimal']>
  reserve0_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserve1?: InputMaybe<Scalars['BigDecimal']>
  reserve1_gt?: InputMaybe<Scalars['BigDecimal']>
  reserve1_gte?: InputMaybe<Scalars['BigDecimal']>
  reserve1_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserve1_lt?: InputMaybe<Scalars['BigDecimal']>
  reserve1_lte?: InputMaybe<Scalars['BigDecimal']>
  reserve1_not?: InputMaybe<Scalars['BigDecimal']>
  reserve1_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserveUSD?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserveUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_not?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  token0?: InputMaybe<Scalars['String']>
  token0_?: InputMaybe<Token_Filter>
  token0_contains?: InputMaybe<Scalars['String']>
  token0_contains_nocase?: InputMaybe<Scalars['String']>
  token0_ends_with?: InputMaybe<Scalars['String']>
  token0_ends_with_nocase?: InputMaybe<Scalars['String']>
  token0_gt?: InputMaybe<Scalars['String']>
  token0_gte?: InputMaybe<Scalars['String']>
  token0_in?: InputMaybe<Array<Scalars['String']>>
  token0_lt?: InputMaybe<Scalars['String']>
  token0_lte?: InputMaybe<Scalars['String']>
  token0_not?: InputMaybe<Scalars['String']>
  token0_not_contains?: InputMaybe<Scalars['String']>
  token0_not_contains_nocase?: InputMaybe<Scalars['String']>
  token0_not_ends_with?: InputMaybe<Scalars['String']>
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  token0_not_in?: InputMaybe<Array<Scalars['String']>>
  token0_not_starts_with?: InputMaybe<Scalars['String']>
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  token0_starts_with?: InputMaybe<Scalars['String']>
  token0_starts_with_nocase?: InputMaybe<Scalars['String']>
  token1?: InputMaybe<Scalars['String']>
  token1_?: InputMaybe<Token_Filter>
  token1_contains?: InputMaybe<Scalars['String']>
  token1_contains_nocase?: InputMaybe<Scalars['String']>
  token1_ends_with?: InputMaybe<Scalars['String']>
  token1_ends_with_nocase?: InputMaybe<Scalars['String']>
  token1_gt?: InputMaybe<Scalars['String']>
  token1_gte?: InputMaybe<Scalars['String']>
  token1_in?: InputMaybe<Array<Scalars['String']>>
  token1_lt?: InputMaybe<Scalars['String']>
  token1_lte?: InputMaybe<Scalars['String']>
  token1_not?: InputMaybe<Scalars['String']>
  token1_not_contains?: InputMaybe<Scalars['String']>
  token1_not_contains_nocase?: InputMaybe<Scalars['String']>
  token1_not_ends_with?: InputMaybe<Scalars['String']>
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  token1_not_in?: InputMaybe<Array<Scalars['String']>>
  token1_not_starts_with?: InputMaybe<Scalars['String']>
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  token1_starts_with?: InputMaybe<Scalars['String']>
  token1_starts_with_nocase?: InputMaybe<Scalars['String']>
  totalSupply?: InputMaybe<Scalars['BigDecimal']>
  totalSupply_gt?: InputMaybe<Scalars['BigDecimal']>
  totalSupply_gte?: InputMaybe<Scalars['BigDecimal']>
  totalSupply_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalSupply_lt?: InputMaybe<Scalars['BigDecimal']>
  totalSupply_lte?: InputMaybe<Scalars['BigDecimal']>
  totalSupply_not?: InputMaybe<Scalars['BigDecimal']>
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
}

export enum PairDayData_OrderBy {
  DailyTxns = 'dailyTxns',
  DailyVolumeToken0 = 'dailyVolumeToken0',
  DailyVolumeToken1 = 'dailyVolumeToken1',
  DailyVolumeUsd = 'dailyVolumeUSD',
  Date = 'date',
  Id = 'id',
  PairAddress = 'pairAddress',
  Reserve0 = 'reserve0',
  Reserve1 = 'reserve1',
  ReserveUsd = 'reserveUSD',
  Token0 = 'token0',
  Token0Decimals = 'token0__decimals',
  Token0DerivedNativeCurrency = 'token0__derivedNativeCurrency',
  Token0Id = 'token0__id',
  Token0Name = 'token0__name',
  Token0Symbol = 'token0__symbol',
  Token0TotalLiquidity = 'token0__totalLiquidity',
  Token0TotalSupply = 'token0__totalSupply',
  Token0TradeVolume = 'token0__tradeVolume',
  Token0TradeVolumeUsd = 'token0__tradeVolumeUSD',
  Token0TxCount = 'token0__txCount',
  Token0UntrackedVolumeUsd = 'token0__untrackedVolumeUSD',
  Token1 = 'token1',
  Token1Decimals = 'token1__decimals',
  Token1DerivedNativeCurrency = 'token1__derivedNativeCurrency',
  Token1Id = 'token1__id',
  Token1Name = 'token1__name',
  Token1Symbol = 'token1__symbol',
  Token1TotalLiquidity = 'token1__totalLiquidity',
  Token1TotalSupply = 'token1__totalSupply',
  Token1TradeVolume = 'token1__tradeVolume',
  Token1TradeVolumeUsd = 'token1__tradeVolumeUSD',
  Token1TxCount = 'token1__txCount',
  Token1UntrackedVolumeUsd = 'token1__untrackedVolumeUSD',
  TotalSupply = 'totalSupply',
}

export type PairHourData = {
  __typename?: 'PairHourData'
  hourStartUnix: Scalars['Int']
  hourlyTxns: Scalars['BigInt']
  hourlyVolumeToken0: Scalars['BigDecimal']
  hourlyVolumeToken1: Scalars['BigDecimal']
  hourlyVolumeUSD: Scalars['BigDecimal']
  id: Scalars['ID']
  pair: Pair
  reserve0: Scalars['BigDecimal']
  reserve1: Scalars['BigDecimal']
  reserveUSD: Scalars['BigDecimal']
}

export type PairHourData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<PairHourData_Filter>>>
  hourStartUnix?: InputMaybe<Scalars['Int']>
  hourStartUnix_gt?: InputMaybe<Scalars['Int']>
  hourStartUnix_gte?: InputMaybe<Scalars['Int']>
  hourStartUnix_in?: InputMaybe<Array<Scalars['Int']>>
  hourStartUnix_lt?: InputMaybe<Scalars['Int']>
  hourStartUnix_lte?: InputMaybe<Scalars['Int']>
  hourStartUnix_not?: InputMaybe<Scalars['Int']>
  hourStartUnix_not_in?: InputMaybe<Array<Scalars['Int']>>
  hourlyTxns?: InputMaybe<Scalars['BigInt']>
  hourlyTxns_gt?: InputMaybe<Scalars['BigInt']>
  hourlyTxns_gte?: InputMaybe<Scalars['BigInt']>
  hourlyTxns_in?: InputMaybe<Array<Scalars['BigInt']>>
  hourlyTxns_lt?: InputMaybe<Scalars['BigInt']>
  hourlyTxns_lte?: InputMaybe<Scalars['BigInt']>
  hourlyTxns_not?: InputMaybe<Scalars['BigInt']>
  hourlyTxns_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  hourlyVolumeToken0?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeToken0_gt?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeToken0_gte?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeToken0_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  hourlyVolumeToken0_lt?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeToken0_lte?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeToken0_not?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  hourlyVolumeToken1?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeToken1_gt?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeToken1_gte?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeToken1_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  hourlyVolumeToken1_lt?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeToken1_lte?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeToken1_not?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  hourlyVolumeUSD?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  hourlyVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']>
  hourlyVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  or?: InputMaybe<Array<InputMaybe<PairHourData_Filter>>>
  pair?: InputMaybe<Scalars['String']>
  pair_?: InputMaybe<Pair_Filter>
  pair_contains?: InputMaybe<Scalars['String']>
  pair_contains_nocase?: InputMaybe<Scalars['String']>
  pair_ends_with?: InputMaybe<Scalars['String']>
  pair_ends_with_nocase?: InputMaybe<Scalars['String']>
  pair_gt?: InputMaybe<Scalars['String']>
  pair_gte?: InputMaybe<Scalars['String']>
  pair_in?: InputMaybe<Array<Scalars['String']>>
  pair_lt?: InputMaybe<Scalars['String']>
  pair_lte?: InputMaybe<Scalars['String']>
  pair_not?: InputMaybe<Scalars['String']>
  pair_not_contains?: InputMaybe<Scalars['String']>
  pair_not_contains_nocase?: InputMaybe<Scalars['String']>
  pair_not_ends_with?: InputMaybe<Scalars['String']>
  pair_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  pair_not_in?: InputMaybe<Array<Scalars['String']>>
  pair_not_starts_with?: InputMaybe<Scalars['String']>
  pair_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  pair_starts_with?: InputMaybe<Scalars['String']>
  pair_starts_with_nocase?: InputMaybe<Scalars['String']>
  reserve0?: InputMaybe<Scalars['BigDecimal']>
  reserve0_gt?: InputMaybe<Scalars['BigDecimal']>
  reserve0_gte?: InputMaybe<Scalars['BigDecimal']>
  reserve0_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserve0_lt?: InputMaybe<Scalars['BigDecimal']>
  reserve0_lte?: InputMaybe<Scalars['BigDecimal']>
  reserve0_not?: InputMaybe<Scalars['BigDecimal']>
  reserve0_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserve1?: InputMaybe<Scalars['BigDecimal']>
  reserve1_gt?: InputMaybe<Scalars['BigDecimal']>
  reserve1_gte?: InputMaybe<Scalars['BigDecimal']>
  reserve1_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserve1_lt?: InputMaybe<Scalars['BigDecimal']>
  reserve1_lte?: InputMaybe<Scalars['BigDecimal']>
  reserve1_not?: InputMaybe<Scalars['BigDecimal']>
  reserve1_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserveUSD?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserveUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_not?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
}

export enum PairHourData_OrderBy {
  HourStartUnix = 'hourStartUnix',
  HourlyTxns = 'hourlyTxns',
  HourlyVolumeToken0 = 'hourlyVolumeToken0',
  HourlyVolumeToken1 = 'hourlyVolumeToken1',
  HourlyVolumeUsd = 'hourlyVolumeUSD',
  Id = 'id',
  Pair = 'pair',
  PairCreatedAtBlockNumber = 'pair__createdAtBlockNumber',
  PairCreatedAtTimestamp = 'pair__createdAtTimestamp',
  PairId = 'pair__id',
  PairLiquidityProviderCount = 'pair__liquidityProviderCount',
  PairReserve0 = 'pair__reserve0',
  PairReserve1 = 'pair__reserve1',
  PairReserveNativeCurrency = 'pair__reserveNativeCurrency',
  PairReserveUsd = 'pair__reserveUSD',
  PairSwapFee = 'pair__swapFee',
  PairToken0Price = 'pair__token0Price',
  PairToken1Price = 'pair__token1Price',
  PairTotalSupply = 'pair__totalSupply',
  PairTrackedReserveNativeCurrency = 'pair__trackedReserveNativeCurrency',
  PairTxCount = 'pair__txCount',
  PairUntrackedVolumeUsd = 'pair__untrackedVolumeUSD',
  PairVolumeToken0 = 'pair__volumeToken0',
  PairVolumeToken1 = 'pair__volumeToken1',
  PairVolumeUsd = 'pair__volumeUSD',
  Reserve0 = 'reserve0',
  Reserve1 = 'reserve1',
  ReserveUsd = 'reserveUSD',
}

export type Pair_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<Pair_Filter>>>
  burns_?: InputMaybe<Burn_Filter>
  createdAtBlockNumber?: InputMaybe<Scalars['BigInt']>
  createdAtBlockNumber_gt?: InputMaybe<Scalars['BigInt']>
  createdAtBlockNumber_gte?: InputMaybe<Scalars['BigInt']>
  createdAtBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>
  createdAtBlockNumber_lt?: InputMaybe<Scalars['BigInt']>
  createdAtBlockNumber_lte?: InputMaybe<Scalars['BigInt']>
  createdAtBlockNumber_not?: InputMaybe<Scalars['BigInt']>
  createdAtBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']>
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']>
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']>
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']>
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']>
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']>
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  liquidityMiningCampaigns_?: InputMaybe<LiquidityMiningCampaign_Filter>
  liquidityPositionSnapshots_?: InputMaybe<LiquidityPositionSnapshot_Filter>
  liquidityPositions_?: InputMaybe<LiquidityPosition_Filter>
  liquidityProviderCount?: InputMaybe<Scalars['BigInt']>
  liquidityProviderCount_gt?: InputMaybe<Scalars['BigInt']>
  liquidityProviderCount_gte?: InputMaybe<Scalars['BigInt']>
  liquidityProviderCount_in?: InputMaybe<Array<Scalars['BigInt']>>
  liquidityProviderCount_lt?: InputMaybe<Scalars['BigInt']>
  liquidityProviderCount_lte?: InputMaybe<Scalars['BigInt']>
  liquidityProviderCount_not?: InputMaybe<Scalars['BigInt']>
  liquidityProviderCount_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  mints_?: InputMaybe<Mint_Filter>
  or?: InputMaybe<Array<InputMaybe<Pair_Filter>>>
  pairHourData_?: InputMaybe<PairHourData_Filter>
  reserve0?: InputMaybe<Scalars['BigDecimal']>
  reserve0_gt?: InputMaybe<Scalars['BigDecimal']>
  reserve0_gte?: InputMaybe<Scalars['BigDecimal']>
  reserve0_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserve0_lt?: InputMaybe<Scalars['BigDecimal']>
  reserve0_lte?: InputMaybe<Scalars['BigDecimal']>
  reserve0_not?: InputMaybe<Scalars['BigDecimal']>
  reserve0_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserve1?: InputMaybe<Scalars['BigDecimal']>
  reserve1_gt?: InputMaybe<Scalars['BigDecimal']>
  reserve1_gte?: InputMaybe<Scalars['BigDecimal']>
  reserve1_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserve1_lt?: InputMaybe<Scalars['BigDecimal']>
  reserve1_lte?: InputMaybe<Scalars['BigDecimal']>
  reserve1_not?: InputMaybe<Scalars['BigDecimal']>
  reserve1_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserveNativeCurrency?: InputMaybe<Scalars['BigDecimal']>
  reserveNativeCurrency_gt?: InputMaybe<Scalars['BigDecimal']>
  reserveNativeCurrency_gte?: InputMaybe<Scalars['BigDecimal']>
  reserveNativeCurrency_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserveNativeCurrency_lt?: InputMaybe<Scalars['BigDecimal']>
  reserveNativeCurrency_lte?: InputMaybe<Scalars['BigDecimal']>
  reserveNativeCurrency_not?: InputMaybe<Scalars['BigDecimal']>
  reserveNativeCurrency_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserveUSD?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  reserveUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_not?: InputMaybe<Scalars['BigDecimal']>
  reserveUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  swapFee?: InputMaybe<Scalars['BigInt']>
  swapFee_gt?: InputMaybe<Scalars['BigInt']>
  swapFee_gte?: InputMaybe<Scalars['BigInt']>
  swapFee_in?: InputMaybe<Array<Scalars['BigInt']>>
  swapFee_lt?: InputMaybe<Scalars['BigInt']>
  swapFee_lte?: InputMaybe<Scalars['BigInt']>
  swapFee_not?: InputMaybe<Scalars['BigInt']>
  swapFee_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  swaps_?: InputMaybe<Swap_Filter>
  token0?: InputMaybe<Scalars['String']>
  token0Price?: InputMaybe<Scalars['BigDecimal']>
  token0Price_gt?: InputMaybe<Scalars['BigDecimal']>
  token0Price_gte?: InputMaybe<Scalars['BigDecimal']>
  token0Price_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  token0Price_lt?: InputMaybe<Scalars['BigDecimal']>
  token0Price_lte?: InputMaybe<Scalars['BigDecimal']>
  token0Price_not?: InputMaybe<Scalars['BigDecimal']>
  token0Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  token0_?: InputMaybe<Token_Filter>
  token0_contains?: InputMaybe<Scalars['String']>
  token0_contains_nocase?: InputMaybe<Scalars['String']>
  token0_ends_with?: InputMaybe<Scalars['String']>
  token0_ends_with_nocase?: InputMaybe<Scalars['String']>
  token0_gt?: InputMaybe<Scalars['String']>
  token0_gte?: InputMaybe<Scalars['String']>
  token0_in?: InputMaybe<Array<Scalars['String']>>
  token0_lt?: InputMaybe<Scalars['String']>
  token0_lte?: InputMaybe<Scalars['String']>
  token0_not?: InputMaybe<Scalars['String']>
  token0_not_contains?: InputMaybe<Scalars['String']>
  token0_not_contains_nocase?: InputMaybe<Scalars['String']>
  token0_not_ends_with?: InputMaybe<Scalars['String']>
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  token0_not_in?: InputMaybe<Array<Scalars['String']>>
  token0_not_starts_with?: InputMaybe<Scalars['String']>
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  token0_starts_with?: InputMaybe<Scalars['String']>
  token0_starts_with_nocase?: InputMaybe<Scalars['String']>
  token1?: InputMaybe<Scalars['String']>
  token1Price?: InputMaybe<Scalars['BigDecimal']>
  token1Price_gt?: InputMaybe<Scalars['BigDecimal']>
  token1Price_gte?: InputMaybe<Scalars['BigDecimal']>
  token1Price_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  token1Price_lt?: InputMaybe<Scalars['BigDecimal']>
  token1Price_lte?: InputMaybe<Scalars['BigDecimal']>
  token1Price_not?: InputMaybe<Scalars['BigDecimal']>
  token1Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  token1_?: InputMaybe<Token_Filter>
  token1_contains?: InputMaybe<Scalars['String']>
  token1_contains_nocase?: InputMaybe<Scalars['String']>
  token1_ends_with?: InputMaybe<Scalars['String']>
  token1_ends_with_nocase?: InputMaybe<Scalars['String']>
  token1_gt?: InputMaybe<Scalars['String']>
  token1_gte?: InputMaybe<Scalars['String']>
  token1_in?: InputMaybe<Array<Scalars['String']>>
  token1_lt?: InputMaybe<Scalars['String']>
  token1_lte?: InputMaybe<Scalars['String']>
  token1_not?: InputMaybe<Scalars['String']>
  token1_not_contains?: InputMaybe<Scalars['String']>
  token1_not_contains_nocase?: InputMaybe<Scalars['String']>
  token1_not_ends_with?: InputMaybe<Scalars['String']>
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  token1_not_in?: InputMaybe<Array<Scalars['String']>>
  token1_not_starts_with?: InputMaybe<Scalars['String']>
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  token1_starts_with?: InputMaybe<Scalars['String']>
  token1_starts_with_nocase?: InputMaybe<Scalars['String']>
  totalSupply?: InputMaybe<Scalars['BigDecimal']>
  totalSupply_gt?: InputMaybe<Scalars['BigDecimal']>
  totalSupply_gte?: InputMaybe<Scalars['BigDecimal']>
  totalSupply_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalSupply_lt?: InputMaybe<Scalars['BigDecimal']>
  totalSupply_lte?: InputMaybe<Scalars['BigDecimal']>
  totalSupply_not?: InputMaybe<Scalars['BigDecimal']>
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  trackedReserveNativeCurrency?: InputMaybe<Scalars['BigDecimal']>
  trackedReserveNativeCurrency_gt?: InputMaybe<Scalars['BigDecimal']>
  trackedReserveNativeCurrency_gte?: InputMaybe<Scalars['BigDecimal']>
  trackedReserveNativeCurrency_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  trackedReserveNativeCurrency_lt?: InputMaybe<Scalars['BigDecimal']>
  trackedReserveNativeCurrency_lte?: InputMaybe<Scalars['BigDecimal']>
  trackedReserveNativeCurrency_not?: InputMaybe<Scalars['BigDecimal']>
  trackedReserveNativeCurrency_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  txCount?: InputMaybe<Scalars['BigInt']>
  txCount_gt?: InputMaybe<Scalars['BigInt']>
  txCount_gte?: InputMaybe<Scalars['BigInt']>
  txCount_in?: InputMaybe<Array<Scalars['BigInt']>>
  txCount_lt?: InputMaybe<Scalars['BigInt']>
  txCount_lte?: InputMaybe<Scalars['BigInt']>
  txCount_not?: InputMaybe<Scalars['BigInt']>
  txCount_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  untrackedVolumeUSD?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  untrackedVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  volumeToken0?: InputMaybe<Scalars['BigDecimal']>
  volumeToken0_gt?: InputMaybe<Scalars['BigDecimal']>
  volumeToken0_gte?: InputMaybe<Scalars['BigDecimal']>
  volumeToken0_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  volumeToken0_lt?: InputMaybe<Scalars['BigDecimal']>
  volumeToken0_lte?: InputMaybe<Scalars['BigDecimal']>
  volumeToken0_not?: InputMaybe<Scalars['BigDecimal']>
  volumeToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  volumeToken1?: InputMaybe<Scalars['BigDecimal']>
  volumeToken1_gt?: InputMaybe<Scalars['BigDecimal']>
  volumeToken1_gte?: InputMaybe<Scalars['BigDecimal']>
  volumeToken1_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  volumeToken1_lt?: InputMaybe<Scalars['BigDecimal']>
  volumeToken1_lte?: InputMaybe<Scalars['BigDecimal']>
  volumeToken1_not?: InputMaybe<Scalars['BigDecimal']>
  volumeToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  volumeUSD?: InputMaybe<Scalars['BigDecimal']>
  volumeUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  volumeUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  volumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  volumeUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  volumeUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  volumeUSD_not?: InputMaybe<Scalars['BigDecimal']>
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
}

export enum Pair_OrderBy {
  Burns = 'burns',
  CreatedAtBlockNumber = 'createdAtBlockNumber',
  CreatedAtTimestamp = 'createdAtTimestamp',
  Id = 'id',
  LiquidityMiningCampaigns = 'liquidityMiningCampaigns',
  LiquidityPositionSnapshots = 'liquidityPositionSnapshots',
  LiquidityPositions = 'liquidityPositions',
  LiquidityProviderCount = 'liquidityProviderCount',
  Mints = 'mints',
  PairHourData = 'pairHourData',
  Reserve0 = 'reserve0',
  Reserve1 = 'reserve1',
  ReserveNativeCurrency = 'reserveNativeCurrency',
  ReserveUsd = 'reserveUSD',
  SwapFee = 'swapFee',
  Swaps = 'swaps',
  Token0 = 'token0',
  Token0Price = 'token0Price',
  Token0Decimals = 'token0__decimals',
  Token0DerivedNativeCurrency = 'token0__derivedNativeCurrency',
  Token0Id = 'token0__id',
  Token0Name = 'token0__name',
  Token0Symbol = 'token0__symbol',
  Token0TotalLiquidity = 'token0__totalLiquidity',
  Token0TotalSupply = 'token0__totalSupply',
  Token0TradeVolume = 'token0__tradeVolume',
  Token0TradeVolumeUsd = 'token0__tradeVolumeUSD',
  Token0TxCount = 'token0__txCount',
  Token0UntrackedVolumeUsd = 'token0__untrackedVolumeUSD',
  Token1 = 'token1',
  Token1Price = 'token1Price',
  Token1Decimals = 'token1__decimals',
  Token1DerivedNativeCurrency = 'token1__derivedNativeCurrency',
  Token1Id = 'token1__id',
  Token1Name = 'token1__name',
  Token1Symbol = 'token1__symbol',
  Token1TotalLiquidity = 'token1__totalLiquidity',
  Token1TotalSupply = 'token1__totalSupply',
  Token1TradeVolume = 'token1__tradeVolume',
  Token1TradeVolumeUsd = 'token1__tradeVolumeUSD',
  Token1TxCount = 'token1__txCount',
  Token1UntrackedVolumeUsd = 'token1__untrackedVolumeUSD',
  TotalSupply = 'totalSupply',
  TrackedReserveNativeCurrency = 'trackedReserveNativeCurrency',
  TxCount = 'txCount',
  UntrackedVolumeUsd = 'untrackedVolumeUSD',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeUsd = 'volumeUSD',
}

export type Query = {
  __typename?: 'Query'
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>
  bundle?: Maybe<Bundle>
  bundles: Array<Bundle>
  burn?: Maybe<Burn>
  burns: Array<Burn>
  claim?: Maybe<Claim>
  claims: Array<Claim>
  dailyUniqueAddressInteraction?: Maybe<DailyUniqueAddressInteraction>
  dailyUniqueAddressInteractions: Array<DailyUniqueAddressInteraction>
  deposit?: Maybe<Deposit>
  deposits: Array<Deposit>
  liquidityMiningCampaign?: Maybe<LiquidityMiningCampaign>
  liquidityMiningCampaignReward?: Maybe<LiquidityMiningCampaignReward>
  liquidityMiningCampaignRewards: Array<LiquidityMiningCampaignReward>
  liquidityMiningCampaigns: Array<LiquidityMiningCampaign>
  liquidityMiningPosition?: Maybe<LiquidityMiningPosition>
  liquidityMiningPositionSnapshot?: Maybe<LiquidityMiningPositionSnapshot>
  liquidityMiningPositionSnapshots: Array<LiquidityMiningPositionSnapshot>
  liquidityMiningPositions: Array<LiquidityMiningPosition>
  liquidityPosition?: Maybe<LiquidityPosition>
  liquidityPositionSnapshot?: Maybe<LiquidityPositionSnapshot>
  liquidityPositionSnapshots: Array<LiquidityPositionSnapshot>
  liquidityPositions: Array<LiquidityPosition>
  mint?: Maybe<Mint>
  mints: Array<Mint>
  monthlyUniqueAddressInteraction?: Maybe<MonthlyUniqueAddressInteraction>
  monthlyUniqueAddressInteractions: Array<MonthlyUniqueAddressInteraction>
  pair?: Maybe<Pair>
  pairDayData?: Maybe<PairDayData>
  pairDayDatas: Array<PairDayData>
  pairHourData?: Maybe<PairHourData>
  pairHourDatas: Array<PairHourData>
  pairs: Array<Pair>
  recoveries: Array<Recovery>
  recovery?: Maybe<Recovery>
  singleSidedStakingCampaign?: Maybe<SingleSidedStakingCampaign>
  singleSidedStakingCampaignClaim?: Maybe<SingleSidedStakingCampaignClaim>
  singleSidedStakingCampaignClaims: Array<SingleSidedStakingCampaignClaim>
  singleSidedStakingCampaignDeposit?: Maybe<SingleSidedStakingCampaignDeposit>
  singleSidedStakingCampaignDeposits: Array<SingleSidedStakingCampaignDeposit>
  singleSidedStakingCampaignPosition?: Maybe<SingleSidedStakingCampaignPosition>
  singleSidedStakingCampaignPositions: Array<SingleSidedStakingCampaignPosition>
  singleSidedStakingCampaignRecoveries: Array<SingleSidedStakingCampaignRecovery>
  singleSidedStakingCampaignRecovery?: Maybe<SingleSidedStakingCampaignRecovery>
  singleSidedStakingCampaignReward?: Maybe<SingleSidedStakingCampaignReward>
  singleSidedStakingCampaignRewards: Array<SingleSidedStakingCampaignReward>
  singleSidedStakingCampaignWithdrawal?: Maybe<SingleSidedStakingCampaignWithdrawal>
  singleSidedStakingCampaignWithdrawals: Array<SingleSidedStakingCampaignWithdrawal>
  singleSidedStakingCampaigns: Array<SingleSidedStakingCampaign>
  swap?: Maybe<Swap>
  swaprDayData?: Maybe<SwaprDayData>
  swaprDayDatas: Array<SwaprDayData>
  swaprFactories: Array<SwaprFactory>
  swaprFactory?: Maybe<SwaprFactory>
  swaprStakingRewardsFactories: Array<SwaprStakingRewardsFactory>
  swaprStakingRewardsFactory?: Maybe<SwaprStakingRewardsFactory>
  swaps: Array<Swap>
  token?: Maybe<Token>
  tokenDayData?: Maybe<TokenDayData>
  tokenDayDatas: Array<TokenDayData>
  tokens: Array<Token>
  transaction?: Maybe<Transaction>
  transactions: Array<Transaction>
  user?: Maybe<User>
  users: Array<User>
  weeklyUniqueAddressInteraction?: Maybe<WeeklyUniqueAddressInteraction>
  weeklyUniqueAddressInteractions: Array<WeeklyUniqueAddressInteraction>
  withdrawal?: Maybe<Withdrawal>
  withdrawals: Array<Withdrawal>
}

export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>
}

export type QueryBundleArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryBundlesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Bundle_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Bundle_Filter>
}

export type QueryBurnArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryBurnsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Burn_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Burn_Filter>
}

export type QueryClaimArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryClaimsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Claim_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Claim_Filter>
}

export type QueryDailyUniqueAddressInteractionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryDailyUniqueAddressInteractionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<DailyUniqueAddressInteraction_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<DailyUniqueAddressInteraction_Filter>
}

export type QueryDepositArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryDepositsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Deposit_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Deposit_Filter>
}

export type QueryLiquidityMiningCampaignArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryLiquidityMiningCampaignRewardArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryLiquidityMiningCampaignRewardsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityMiningCampaignReward_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<LiquidityMiningCampaignReward_Filter>
}

export type QueryLiquidityMiningCampaignsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityMiningCampaign_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<LiquidityMiningCampaign_Filter>
}

export type QueryLiquidityMiningPositionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryLiquidityMiningPositionSnapshotArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryLiquidityMiningPositionSnapshotsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityMiningPositionSnapshot_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<LiquidityMiningPositionSnapshot_Filter>
}

export type QueryLiquidityMiningPositionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityMiningPosition_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<LiquidityMiningPosition_Filter>
}

export type QueryLiquidityPositionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryLiquidityPositionSnapshotArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryLiquidityPositionSnapshotsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityPositionSnapshot_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<LiquidityPositionSnapshot_Filter>
}

export type QueryLiquidityPositionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityPosition_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<LiquidityPosition_Filter>
}

export type QueryMintArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryMintsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Mint_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Mint_Filter>
}

export type QueryMonthlyUniqueAddressInteractionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryMonthlyUniqueAddressInteractionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<MonthlyUniqueAddressInteraction_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<MonthlyUniqueAddressInteraction_Filter>
}

export type QueryPairArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryPairDayDataArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryPairDayDatasArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<PairDayData_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<PairDayData_Filter>
}

export type QueryPairHourDataArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryPairHourDatasArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<PairHourData_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<PairHourData_Filter>
}

export type QueryPairsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Pair_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Pair_Filter>
}

export type QueryRecoveriesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Recovery_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Recovery_Filter>
}

export type QueryRecoveryArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QuerySingleSidedStakingCampaignArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QuerySingleSidedStakingCampaignClaimArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QuerySingleSidedStakingCampaignClaimsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignClaim_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SingleSidedStakingCampaignClaim_Filter>
}

export type QuerySingleSidedStakingCampaignDepositArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QuerySingleSidedStakingCampaignDepositsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignDeposit_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SingleSidedStakingCampaignDeposit_Filter>
}

export type QuerySingleSidedStakingCampaignPositionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QuerySingleSidedStakingCampaignPositionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignPosition_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SingleSidedStakingCampaignPosition_Filter>
}

export type QuerySingleSidedStakingCampaignRecoveriesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignRecovery_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SingleSidedStakingCampaignRecovery_Filter>
}

export type QuerySingleSidedStakingCampaignRecoveryArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QuerySingleSidedStakingCampaignRewardArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QuerySingleSidedStakingCampaignRewardsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignReward_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SingleSidedStakingCampaignReward_Filter>
}

export type QuerySingleSidedStakingCampaignWithdrawalArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QuerySingleSidedStakingCampaignWithdrawalsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignWithdrawal_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SingleSidedStakingCampaignWithdrawal_Filter>
}

export type QuerySingleSidedStakingCampaignsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaign_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SingleSidedStakingCampaign_Filter>
}

export type QuerySwapArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QuerySwaprDayDataArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QuerySwaprDayDatasArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SwaprDayData_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SwaprDayData_Filter>
}

export type QuerySwaprFactoriesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SwaprFactory_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SwaprFactory_Filter>
}

export type QuerySwaprFactoryArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QuerySwaprStakingRewardsFactoriesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SwaprStakingRewardsFactory_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SwaprStakingRewardsFactory_Filter>
}

export type QuerySwaprStakingRewardsFactoryArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QuerySwapsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Swap_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Swap_Filter>
}

export type QueryTokenArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryTokenDayDataArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryTokenDayDatasArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<TokenDayData_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<TokenDayData_Filter>
}

export type QueryTokensArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Token_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Token_Filter>
}

export type QueryTransactionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryTransactionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Transaction_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Transaction_Filter>
}

export type QueryUserArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryUsersArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<User_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<User_Filter>
}

export type QueryWeeklyUniqueAddressInteractionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryWeeklyUniqueAddressInteractionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<WeeklyUniqueAddressInteraction_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<WeeklyUniqueAddressInteraction_Filter>
}

export type QueryWithdrawalArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type QueryWithdrawalsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Withdrawal_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Withdrawal_Filter>
}

export type Recovery = {
  __typename?: 'Recovery'
  amounts: Array<Scalars['BigDecimal']>
  id: Scalars['ID']
  liquidityMiningCampaign: LiquidityMiningCampaign
  timestamp: Scalars['BigInt']
}

export type Recovery_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  amounts?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_contains?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_not?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_not_contains?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_not_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>
  and?: InputMaybe<Array<InputMaybe<Recovery_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  liquidityMiningCampaign?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_?: InputMaybe<LiquidityMiningCampaign_Filter>
  liquidityMiningCampaign_contains?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_contains_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_ends_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_ends_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_gt?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_gte?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_in?: InputMaybe<Array<Scalars['String']>>
  liquidityMiningCampaign_lt?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_lte?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_contains?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_contains_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_ends_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_in?: InputMaybe<Array<Scalars['String']>>
  liquidityMiningCampaign_not_starts_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_starts_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_starts_with_nocase?: InputMaybe<Scalars['String']>
  or?: InputMaybe<Array<InputMaybe<Recovery_Filter>>>
  timestamp?: InputMaybe<Scalars['BigInt']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']>
  timestamp_not?: InputMaybe<Scalars['BigInt']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>
}

export enum Recovery_OrderBy {
  Amounts = 'amounts',
  Id = 'id',
  LiquidityMiningCampaign = 'liquidityMiningCampaign',
  LiquidityMiningCampaignDuration = 'liquidityMiningCampaign__duration',
  LiquidityMiningCampaignEndsAt = 'liquidityMiningCampaign__endsAt',
  LiquidityMiningCampaignId = 'liquidityMiningCampaign__id',
  LiquidityMiningCampaignInitialized = 'liquidityMiningCampaign__initialized',
  LiquidityMiningCampaignLocked = 'liquidityMiningCampaign__locked',
  LiquidityMiningCampaignOwner = 'liquidityMiningCampaign__owner',
  LiquidityMiningCampaignStakedAmount = 'liquidityMiningCampaign__stakedAmount',
  LiquidityMiningCampaignStakingCap = 'liquidityMiningCampaign__stakingCap',
  LiquidityMiningCampaignStartsAt = 'liquidityMiningCampaign__startsAt',
  Timestamp = 'timestamp',
}

export type SingleSidedStakingCampaign = {
  __typename?: 'SingleSidedStakingCampaign'
  claims: Array<SingleSidedStakingCampaignClaim>
  deposits: Array<SingleSidedStakingCampaignDeposit>
  duration: Scalars['BigInt']
  endsAt: Scalars['BigInt']
  id: Scalars['ID']
  initialized: Scalars['Boolean']
  locked: Scalars['Boolean']
  owner: Scalars['Bytes']
  recoveries: Array<SingleSidedStakingCampaignRecovery>
  rewards: Array<SingleSidedStakingCampaignReward>
  singleSidedStakingPositions: Array<SingleSidedStakingCampaignPosition>
  stakeToken: Token
  stakedAmount: Scalars['BigDecimal']
  stakingCap: Scalars['BigDecimal']
  startsAt: Scalars['BigInt']
  withdrawals: Array<SingleSidedStakingCampaignWithdrawal>
}

export type SingleSidedStakingCampaignClaimsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignClaim_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<SingleSidedStakingCampaignClaim_Filter>
}

export type SingleSidedStakingCampaignDepositsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignDeposit_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<SingleSidedStakingCampaignDeposit_Filter>
}

export type SingleSidedStakingCampaignRecoveriesArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignRecovery_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<SingleSidedStakingCampaignRecovery_Filter>
}

export type SingleSidedStakingCampaignRewardsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignReward_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<SingleSidedStakingCampaignReward_Filter>
}

export type SingleSidedStakingCampaignSingleSidedStakingPositionsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignPosition_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<SingleSidedStakingCampaignPosition_Filter>
}

export type SingleSidedStakingCampaignWithdrawalsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignWithdrawal_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<SingleSidedStakingCampaignWithdrawal_Filter>
}

export type SingleSidedStakingCampaignClaim = {
  __typename?: 'SingleSidedStakingCampaignClaim'
  amounts: Array<Scalars['BigDecimal']>
  id: Scalars['ID']
  singleSidedStakingCampaign: SingleSidedStakingCampaign
  timestamp: Scalars['BigInt']
  user: Scalars['Bytes']
}

export type SingleSidedStakingCampaignClaim_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  amounts?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_contains?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_not?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_not_contains?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_not_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>
  and?: InputMaybe<Array<InputMaybe<SingleSidedStakingCampaignClaim_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  or?: InputMaybe<Array<InputMaybe<SingleSidedStakingCampaignClaim_Filter>>>
  singleSidedStakingCampaign?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_?: InputMaybe<SingleSidedStakingCampaign_Filter>
  singleSidedStakingCampaign_contains?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_contains_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_ends_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_ends_with_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_gt?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_gte?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_in?: InputMaybe<Array<Scalars['String']>>
  singleSidedStakingCampaign_lt?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_lte?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_contains?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_contains_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_ends_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_in?: InputMaybe<Array<Scalars['String']>>
  singleSidedStakingCampaign_not_starts_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_starts_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_starts_with_nocase?: InputMaybe<Scalars['String']>
  timestamp?: InputMaybe<Scalars['BigInt']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']>
  timestamp_not?: InputMaybe<Scalars['BigInt']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  user?: InputMaybe<Scalars['Bytes']>
  user_contains?: InputMaybe<Scalars['Bytes']>
  user_gt?: InputMaybe<Scalars['Bytes']>
  user_gte?: InputMaybe<Scalars['Bytes']>
  user_in?: InputMaybe<Array<Scalars['Bytes']>>
  user_lt?: InputMaybe<Scalars['Bytes']>
  user_lte?: InputMaybe<Scalars['Bytes']>
  user_not?: InputMaybe<Scalars['Bytes']>
  user_not_contains?: InputMaybe<Scalars['Bytes']>
  user_not_in?: InputMaybe<Array<Scalars['Bytes']>>
}

export enum SingleSidedStakingCampaignClaim_OrderBy {
  Amounts = 'amounts',
  Id = 'id',
  SingleSidedStakingCampaign = 'singleSidedStakingCampaign',
  SingleSidedStakingCampaignDuration = 'singleSidedStakingCampaign__duration',
  SingleSidedStakingCampaignEndsAt = 'singleSidedStakingCampaign__endsAt',
  SingleSidedStakingCampaignId = 'singleSidedStakingCampaign__id',
  SingleSidedStakingCampaignInitialized = 'singleSidedStakingCampaign__initialized',
  SingleSidedStakingCampaignLocked = 'singleSidedStakingCampaign__locked',
  SingleSidedStakingCampaignOwner = 'singleSidedStakingCampaign__owner',
  SingleSidedStakingCampaignStakedAmount = 'singleSidedStakingCampaign__stakedAmount',
  SingleSidedStakingCampaignStakingCap = 'singleSidedStakingCampaign__stakingCap',
  SingleSidedStakingCampaignStartsAt = 'singleSidedStakingCampaign__startsAt',
  Timestamp = 'timestamp',
  User = 'user',
}

export type SingleSidedStakingCampaignDeposit = {
  __typename?: 'SingleSidedStakingCampaignDeposit'
  amount: Scalars['BigDecimal']
  id: Scalars['ID']
  singleSidedStakingCampaign: SingleSidedStakingCampaign
  timestamp: Scalars['BigInt']
  user: Scalars['Bytes']
}

export type SingleSidedStakingCampaignDeposit_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  amount?: InputMaybe<Scalars['BigDecimal']>
  amount_gt?: InputMaybe<Scalars['BigDecimal']>
  amount_gte?: InputMaybe<Scalars['BigDecimal']>
  amount_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount_lt?: InputMaybe<Scalars['BigDecimal']>
  amount_lte?: InputMaybe<Scalars['BigDecimal']>
  amount_not?: InputMaybe<Scalars['BigDecimal']>
  amount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  and?: InputMaybe<Array<InputMaybe<SingleSidedStakingCampaignDeposit_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  or?: InputMaybe<Array<InputMaybe<SingleSidedStakingCampaignDeposit_Filter>>>
  singleSidedStakingCampaign?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_?: InputMaybe<SingleSidedStakingCampaign_Filter>
  singleSidedStakingCampaign_contains?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_contains_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_ends_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_ends_with_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_gt?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_gte?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_in?: InputMaybe<Array<Scalars['String']>>
  singleSidedStakingCampaign_lt?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_lte?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_contains?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_contains_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_ends_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_in?: InputMaybe<Array<Scalars['String']>>
  singleSidedStakingCampaign_not_starts_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_starts_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_starts_with_nocase?: InputMaybe<Scalars['String']>
  timestamp?: InputMaybe<Scalars['BigInt']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']>
  timestamp_not?: InputMaybe<Scalars['BigInt']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  user?: InputMaybe<Scalars['Bytes']>
  user_contains?: InputMaybe<Scalars['Bytes']>
  user_gt?: InputMaybe<Scalars['Bytes']>
  user_gte?: InputMaybe<Scalars['Bytes']>
  user_in?: InputMaybe<Array<Scalars['Bytes']>>
  user_lt?: InputMaybe<Scalars['Bytes']>
  user_lte?: InputMaybe<Scalars['Bytes']>
  user_not?: InputMaybe<Scalars['Bytes']>
  user_not_contains?: InputMaybe<Scalars['Bytes']>
  user_not_in?: InputMaybe<Array<Scalars['Bytes']>>
}

export enum SingleSidedStakingCampaignDeposit_OrderBy {
  Amount = 'amount',
  Id = 'id',
  SingleSidedStakingCampaign = 'singleSidedStakingCampaign',
  SingleSidedStakingCampaignDuration = 'singleSidedStakingCampaign__duration',
  SingleSidedStakingCampaignEndsAt = 'singleSidedStakingCampaign__endsAt',
  SingleSidedStakingCampaignId = 'singleSidedStakingCampaign__id',
  SingleSidedStakingCampaignInitialized = 'singleSidedStakingCampaign__initialized',
  SingleSidedStakingCampaignLocked = 'singleSidedStakingCampaign__locked',
  SingleSidedStakingCampaignOwner = 'singleSidedStakingCampaign__owner',
  SingleSidedStakingCampaignStakedAmount = 'singleSidedStakingCampaign__stakedAmount',
  SingleSidedStakingCampaignStakingCap = 'singleSidedStakingCampaign__stakingCap',
  SingleSidedStakingCampaignStartsAt = 'singleSidedStakingCampaign__startsAt',
  Timestamp = 'timestamp',
  User = 'user',
}

export type SingleSidedStakingCampaignPosition = {
  __typename?: 'SingleSidedStakingCampaignPosition'
  id: Scalars['ID']
  singleSidedStakingCampaign: SingleSidedStakingCampaign
  stakedAmount: Scalars['BigDecimal']
  user: User
}

export type SingleSidedStakingCampaignPosition_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<SingleSidedStakingCampaignPosition_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  or?: InputMaybe<Array<InputMaybe<SingleSidedStakingCampaignPosition_Filter>>>
  singleSidedStakingCampaign?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_?: InputMaybe<SingleSidedStakingCampaign_Filter>
  singleSidedStakingCampaign_contains?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_contains_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_ends_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_ends_with_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_gt?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_gte?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_in?: InputMaybe<Array<Scalars['String']>>
  singleSidedStakingCampaign_lt?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_lte?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_contains?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_contains_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_ends_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_in?: InputMaybe<Array<Scalars['String']>>
  singleSidedStakingCampaign_not_starts_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_starts_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_starts_with_nocase?: InputMaybe<Scalars['String']>
  stakedAmount?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_gt?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_gte?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  stakedAmount_lt?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_lte?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_not?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  user?: InputMaybe<Scalars['String']>
  user_?: InputMaybe<User_Filter>
  user_contains?: InputMaybe<Scalars['String']>
  user_contains_nocase?: InputMaybe<Scalars['String']>
  user_ends_with?: InputMaybe<Scalars['String']>
  user_ends_with_nocase?: InputMaybe<Scalars['String']>
  user_gt?: InputMaybe<Scalars['String']>
  user_gte?: InputMaybe<Scalars['String']>
  user_in?: InputMaybe<Array<Scalars['String']>>
  user_lt?: InputMaybe<Scalars['String']>
  user_lte?: InputMaybe<Scalars['String']>
  user_not?: InputMaybe<Scalars['String']>
  user_not_contains?: InputMaybe<Scalars['String']>
  user_not_contains_nocase?: InputMaybe<Scalars['String']>
  user_not_ends_with?: InputMaybe<Scalars['String']>
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  user_not_in?: InputMaybe<Array<Scalars['String']>>
  user_not_starts_with?: InputMaybe<Scalars['String']>
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  user_starts_with?: InputMaybe<Scalars['String']>
  user_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum SingleSidedStakingCampaignPosition_OrderBy {
  Id = 'id',
  SingleSidedStakingCampaign = 'singleSidedStakingCampaign',
  SingleSidedStakingCampaignDuration = 'singleSidedStakingCampaign__duration',
  SingleSidedStakingCampaignEndsAt = 'singleSidedStakingCampaign__endsAt',
  SingleSidedStakingCampaignId = 'singleSidedStakingCampaign__id',
  SingleSidedStakingCampaignInitialized = 'singleSidedStakingCampaign__initialized',
  SingleSidedStakingCampaignLocked = 'singleSidedStakingCampaign__locked',
  SingleSidedStakingCampaignOwner = 'singleSidedStakingCampaign__owner',
  SingleSidedStakingCampaignStakedAmount = 'singleSidedStakingCampaign__stakedAmount',
  SingleSidedStakingCampaignStakingCap = 'singleSidedStakingCampaign__stakingCap',
  SingleSidedStakingCampaignStartsAt = 'singleSidedStakingCampaign__startsAt',
  StakedAmount = 'stakedAmount',
  User = 'user',
  UserId = 'user__id',
  UserUsdSwapped = 'user__usdSwapped',
}

export type SingleSidedStakingCampaignRecovery = {
  __typename?: 'SingleSidedStakingCampaignRecovery'
  amounts: Array<Scalars['BigDecimal']>
  id: Scalars['ID']
  singleSidedStakingCampaign: SingleSidedStakingCampaign
  timestamp: Scalars['BigInt']
}

export type SingleSidedStakingCampaignRecovery_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  amounts?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_contains?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_not?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_not_contains?: InputMaybe<Array<Scalars['BigDecimal']>>
  amounts_not_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>
  and?: InputMaybe<Array<InputMaybe<SingleSidedStakingCampaignRecovery_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  or?: InputMaybe<Array<InputMaybe<SingleSidedStakingCampaignRecovery_Filter>>>
  singleSidedStakingCampaign?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_?: InputMaybe<SingleSidedStakingCampaign_Filter>
  singleSidedStakingCampaign_contains?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_contains_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_ends_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_ends_with_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_gt?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_gte?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_in?: InputMaybe<Array<Scalars['String']>>
  singleSidedStakingCampaign_lt?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_lte?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_contains?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_contains_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_ends_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_in?: InputMaybe<Array<Scalars['String']>>
  singleSidedStakingCampaign_not_starts_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_starts_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_starts_with_nocase?: InputMaybe<Scalars['String']>
  timestamp?: InputMaybe<Scalars['BigInt']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']>
  timestamp_not?: InputMaybe<Scalars['BigInt']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>
}

export enum SingleSidedStakingCampaignRecovery_OrderBy {
  Amounts = 'amounts',
  Id = 'id',
  SingleSidedStakingCampaign = 'singleSidedStakingCampaign',
  SingleSidedStakingCampaignDuration = 'singleSidedStakingCampaign__duration',
  SingleSidedStakingCampaignEndsAt = 'singleSidedStakingCampaign__endsAt',
  SingleSidedStakingCampaignId = 'singleSidedStakingCampaign__id',
  SingleSidedStakingCampaignInitialized = 'singleSidedStakingCampaign__initialized',
  SingleSidedStakingCampaignLocked = 'singleSidedStakingCampaign__locked',
  SingleSidedStakingCampaignOwner = 'singleSidedStakingCampaign__owner',
  SingleSidedStakingCampaignStakedAmount = 'singleSidedStakingCampaign__stakedAmount',
  SingleSidedStakingCampaignStakingCap = 'singleSidedStakingCampaign__stakingCap',
  SingleSidedStakingCampaignStartsAt = 'singleSidedStakingCampaign__startsAt',
  Timestamp = 'timestamp',
}

export type SingleSidedStakingCampaignReward = {
  __typename?: 'SingleSidedStakingCampaignReward'
  amount: Scalars['BigDecimal']
  id: Scalars['ID']
  token: Token
}

export type SingleSidedStakingCampaignReward_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  amount?: InputMaybe<Scalars['BigDecimal']>
  amount_gt?: InputMaybe<Scalars['BigDecimal']>
  amount_gte?: InputMaybe<Scalars['BigDecimal']>
  amount_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount_lt?: InputMaybe<Scalars['BigDecimal']>
  amount_lte?: InputMaybe<Scalars['BigDecimal']>
  amount_not?: InputMaybe<Scalars['BigDecimal']>
  amount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  and?: InputMaybe<Array<InputMaybe<SingleSidedStakingCampaignReward_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  or?: InputMaybe<Array<InputMaybe<SingleSidedStakingCampaignReward_Filter>>>
  token?: InputMaybe<Scalars['String']>
  token_?: InputMaybe<Token_Filter>
  token_contains?: InputMaybe<Scalars['String']>
  token_contains_nocase?: InputMaybe<Scalars['String']>
  token_ends_with?: InputMaybe<Scalars['String']>
  token_ends_with_nocase?: InputMaybe<Scalars['String']>
  token_gt?: InputMaybe<Scalars['String']>
  token_gte?: InputMaybe<Scalars['String']>
  token_in?: InputMaybe<Array<Scalars['String']>>
  token_lt?: InputMaybe<Scalars['String']>
  token_lte?: InputMaybe<Scalars['String']>
  token_not?: InputMaybe<Scalars['String']>
  token_not_contains?: InputMaybe<Scalars['String']>
  token_not_contains_nocase?: InputMaybe<Scalars['String']>
  token_not_ends_with?: InputMaybe<Scalars['String']>
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  token_not_in?: InputMaybe<Array<Scalars['String']>>
  token_not_starts_with?: InputMaybe<Scalars['String']>
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  token_starts_with?: InputMaybe<Scalars['String']>
  token_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum SingleSidedStakingCampaignReward_OrderBy {
  Amount = 'amount',
  Id = 'id',
  Token = 'token',
  TokenDecimals = 'token__decimals',
  TokenDerivedNativeCurrency = 'token__derivedNativeCurrency',
  TokenId = 'token__id',
  TokenName = 'token__name',
  TokenSymbol = 'token__symbol',
  TokenTotalLiquidity = 'token__totalLiquidity',
  TokenTotalSupply = 'token__totalSupply',
  TokenTradeVolume = 'token__tradeVolume',
  TokenTradeVolumeUsd = 'token__tradeVolumeUSD',
  TokenTxCount = 'token__txCount',
  TokenUntrackedVolumeUsd = 'token__untrackedVolumeUSD',
}

export type SingleSidedStakingCampaignWithdrawal = {
  __typename?: 'SingleSidedStakingCampaignWithdrawal'
  amount: Scalars['BigDecimal']
  id: Scalars['ID']
  singleSidedStakingCampaign: SingleSidedStakingCampaign
  timestamp: Scalars['BigInt']
  user: Scalars['Bytes']
}

export type SingleSidedStakingCampaignWithdrawal_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  amount?: InputMaybe<Scalars['BigDecimal']>
  amount_gt?: InputMaybe<Scalars['BigDecimal']>
  amount_gte?: InputMaybe<Scalars['BigDecimal']>
  amount_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount_lt?: InputMaybe<Scalars['BigDecimal']>
  amount_lte?: InputMaybe<Scalars['BigDecimal']>
  amount_not?: InputMaybe<Scalars['BigDecimal']>
  amount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  and?: InputMaybe<Array<InputMaybe<SingleSidedStakingCampaignWithdrawal_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  or?: InputMaybe<Array<InputMaybe<SingleSidedStakingCampaignWithdrawal_Filter>>>
  singleSidedStakingCampaign?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_?: InputMaybe<SingleSidedStakingCampaign_Filter>
  singleSidedStakingCampaign_contains?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_contains_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_ends_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_ends_with_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_gt?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_gte?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_in?: InputMaybe<Array<Scalars['String']>>
  singleSidedStakingCampaign_lt?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_lte?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_contains?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_contains_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_ends_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_in?: InputMaybe<Array<Scalars['String']>>
  singleSidedStakingCampaign_not_starts_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_starts_with?: InputMaybe<Scalars['String']>
  singleSidedStakingCampaign_starts_with_nocase?: InputMaybe<Scalars['String']>
  timestamp?: InputMaybe<Scalars['BigInt']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']>
  timestamp_not?: InputMaybe<Scalars['BigInt']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  user?: InputMaybe<Scalars['Bytes']>
  user_contains?: InputMaybe<Scalars['Bytes']>
  user_gt?: InputMaybe<Scalars['Bytes']>
  user_gte?: InputMaybe<Scalars['Bytes']>
  user_in?: InputMaybe<Array<Scalars['Bytes']>>
  user_lt?: InputMaybe<Scalars['Bytes']>
  user_lte?: InputMaybe<Scalars['Bytes']>
  user_not?: InputMaybe<Scalars['Bytes']>
  user_not_contains?: InputMaybe<Scalars['Bytes']>
  user_not_in?: InputMaybe<Array<Scalars['Bytes']>>
}

export enum SingleSidedStakingCampaignWithdrawal_OrderBy {
  Amount = 'amount',
  Id = 'id',
  SingleSidedStakingCampaign = 'singleSidedStakingCampaign',
  SingleSidedStakingCampaignDuration = 'singleSidedStakingCampaign__duration',
  SingleSidedStakingCampaignEndsAt = 'singleSidedStakingCampaign__endsAt',
  SingleSidedStakingCampaignId = 'singleSidedStakingCampaign__id',
  SingleSidedStakingCampaignInitialized = 'singleSidedStakingCampaign__initialized',
  SingleSidedStakingCampaignLocked = 'singleSidedStakingCampaign__locked',
  SingleSidedStakingCampaignOwner = 'singleSidedStakingCampaign__owner',
  SingleSidedStakingCampaignStakedAmount = 'singleSidedStakingCampaign__stakedAmount',
  SingleSidedStakingCampaignStakingCap = 'singleSidedStakingCampaign__stakingCap',
  SingleSidedStakingCampaignStartsAt = 'singleSidedStakingCampaign__startsAt',
  Timestamp = 'timestamp',
  User = 'user',
}

export type SingleSidedStakingCampaign_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<SingleSidedStakingCampaign_Filter>>>
  claims_?: InputMaybe<SingleSidedStakingCampaignClaim_Filter>
  deposits_?: InputMaybe<SingleSidedStakingCampaignDeposit_Filter>
  duration?: InputMaybe<Scalars['BigInt']>
  duration_gt?: InputMaybe<Scalars['BigInt']>
  duration_gte?: InputMaybe<Scalars['BigInt']>
  duration_in?: InputMaybe<Array<Scalars['BigInt']>>
  duration_lt?: InputMaybe<Scalars['BigInt']>
  duration_lte?: InputMaybe<Scalars['BigInt']>
  duration_not?: InputMaybe<Scalars['BigInt']>
  duration_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  endsAt?: InputMaybe<Scalars['BigInt']>
  endsAt_gt?: InputMaybe<Scalars['BigInt']>
  endsAt_gte?: InputMaybe<Scalars['BigInt']>
  endsAt_in?: InputMaybe<Array<Scalars['BigInt']>>
  endsAt_lt?: InputMaybe<Scalars['BigInt']>
  endsAt_lte?: InputMaybe<Scalars['BigInt']>
  endsAt_not?: InputMaybe<Scalars['BigInt']>
  endsAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  initialized?: InputMaybe<Scalars['Boolean']>
  initialized_in?: InputMaybe<Array<Scalars['Boolean']>>
  initialized_not?: InputMaybe<Scalars['Boolean']>
  initialized_not_in?: InputMaybe<Array<Scalars['Boolean']>>
  locked?: InputMaybe<Scalars['Boolean']>
  locked_in?: InputMaybe<Array<Scalars['Boolean']>>
  locked_not?: InputMaybe<Scalars['Boolean']>
  locked_not_in?: InputMaybe<Array<Scalars['Boolean']>>
  or?: InputMaybe<Array<InputMaybe<SingleSidedStakingCampaign_Filter>>>
  owner?: InputMaybe<Scalars['Bytes']>
  owner_contains?: InputMaybe<Scalars['Bytes']>
  owner_gt?: InputMaybe<Scalars['Bytes']>
  owner_gte?: InputMaybe<Scalars['Bytes']>
  owner_in?: InputMaybe<Array<Scalars['Bytes']>>
  owner_lt?: InputMaybe<Scalars['Bytes']>
  owner_lte?: InputMaybe<Scalars['Bytes']>
  owner_not?: InputMaybe<Scalars['Bytes']>
  owner_not_contains?: InputMaybe<Scalars['Bytes']>
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']>>
  recoveries_?: InputMaybe<SingleSidedStakingCampaignRecovery_Filter>
  rewards?: InputMaybe<Array<Scalars['String']>>
  rewards_?: InputMaybe<SingleSidedStakingCampaignReward_Filter>
  rewards_contains?: InputMaybe<Array<Scalars['String']>>
  rewards_contains_nocase?: InputMaybe<Array<Scalars['String']>>
  rewards_not?: InputMaybe<Array<Scalars['String']>>
  rewards_not_contains?: InputMaybe<Array<Scalars['String']>>
  rewards_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
  singleSidedStakingPositions_?: InputMaybe<SingleSidedStakingCampaignPosition_Filter>
  stakeToken?: InputMaybe<Scalars['String']>
  stakeToken_?: InputMaybe<Token_Filter>
  stakeToken_contains?: InputMaybe<Scalars['String']>
  stakeToken_contains_nocase?: InputMaybe<Scalars['String']>
  stakeToken_ends_with?: InputMaybe<Scalars['String']>
  stakeToken_ends_with_nocase?: InputMaybe<Scalars['String']>
  stakeToken_gt?: InputMaybe<Scalars['String']>
  stakeToken_gte?: InputMaybe<Scalars['String']>
  stakeToken_in?: InputMaybe<Array<Scalars['String']>>
  stakeToken_lt?: InputMaybe<Scalars['String']>
  stakeToken_lte?: InputMaybe<Scalars['String']>
  stakeToken_not?: InputMaybe<Scalars['String']>
  stakeToken_not_contains?: InputMaybe<Scalars['String']>
  stakeToken_not_contains_nocase?: InputMaybe<Scalars['String']>
  stakeToken_not_ends_with?: InputMaybe<Scalars['String']>
  stakeToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  stakeToken_not_in?: InputMaybe<Array<Scalars['String']>>
  stakeToken_not_starts_with?: InputMaybe<Scalars['String']>
  stakeToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  stakeToken_starts_with?: InputMaybe<Scalars['String']>
  stakeToken_starts_with_nocase?: InputMaybe<Scalars['String']>
  stakedAmount?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_gt?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_gte?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  stakedAmount_lt?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_lte?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_not?: InputMaybe<Scalars['BigDecimal']>
  stakedAmount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  stakingCap?: InputMaybe<Scalars['BigDecimal']>
  stakingCap_gt?: InputMaybe<Scalars['BigDecimal']>
  stakingCap_gte?: InputMaybe<Scalars['BigDecimal']>
  stakingCap_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  stakingCap_lt?: InputMaybe<Scalars['BigDecimal']>
  stakingCap_lte?: InputMaybe<Scalars['BigDecimal']>
  stakingCap_not?: InputMaybe<Scalars['BigDecimal']>
  stakingCap_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  startsAt?: InputMaybe<Scalars['BigInt']>
  startsAt_gt?: InputMaybe<Scalars['BigInt']>
  startsAt_gte?: InputMaybe<Scalars['BigInt']>
  startsAt_in?: InputMaybe<Array<Scalars['BigInt']>>
  startsAt_lt?: InputMaybe<Scalars['BigInt']>
  startsAt_lte?: InputMaybe<Scalars['BigInt']>
  startsAt_not?: InputMaybe<Scalars['BigInt']>
  startsAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  withdrawals_?: InputMaybe<SingleSidedStakingCampaignWithdrawal_Filter>
}

export enum SingleSidedStakingCampaign_OrderBy {
  Claims = 'claims',
  Deposits = 'deposits',
  Duration = 'duration',
  EndsAt = 'endsAt',
  Id = 'id',
  Initialized = 'initialized',
  Locked = 'locked',
  Owner = 'owner',
  Recoveries = 'recoveries',
  Rewards = 'rewards',
  SingleSidedStakingPositions = 'singleSidedStakingPositions',
  StakeToken = 'stakeToken',
  StakeTokenDecimals = 'stakeToken__decimals',
  StakeTokenDerivedNativeCurrency = 'stakeToken__derivedNativeCurrency',
  StakeTokenId = 'stakeToken__id',
  StakeTokenName = 'stakeToken__name',
  StakeTokenSymbol = 'stakeToken__symbol',
  StakeTokenTotalLiquidity = 'stakeToken__totalLiquidity',
  StakeTokenTotalSupply = 'stakeToken__totalSupply',
  StakeTokenTradeVolume = 'stakeToken__tradeVolume',
  StakeTokenTradeVolumeUsd = 'stakeToken__tradeVolumeUSD',
  StakeTokenTxCount = 'stakeToken__txCount',
  StakeTokenUntrackedVolumeUsd = 'stakeToken__untrackedVolumeUSD',
  StakedAmount = 'stakedAmount',
  StakingCap = 'stakingCap',
  StartsAt = 'startsAt',
  Withdrawals = 'withdrawals',
}

export type Subscription = {
  __typename?: 'Subscription'
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>
  bundle?: Maybe<Bundle>
  bundles: Array<Bundle>
  burn?: Maybe<Burn>
  burns: Array<Burn>
  claim?: Maybe<Claim>
  claims: Array<Claim>
  dailyUniqueAddressInteraction?: Maybe<DailyUniqueAddressInteraction>
  dailyUniqueAddressInteractions: Array<DailyUniqueAddressInteraction>
  deposit?: Maybe<Deposit>
  deposits: Array<Deposit>
  liquidityMiningCampaign?: Maybe<LiquidityMiningCampaign>
  liquidityMiningCampaignReward?: Maybe<LiquidityMiningCampaignReward>
  liquidityMiningCampaignRewards: Array<LiquidityMiningCampaignReward>
  liquidityMiningCampaigns: Array<LiquidityMiningCampaign>
  liquidityMiningPosition?: Maybe<LiquidityMiningPosition>
  liquidityMiningPositionSnapshot?: Maybe<LiquidityMiningPositionSnapshot>
  liquidityMiningPositionSnapshots: Array<LiquidityMiningPositionSnapshot>
  liquidityMiningPositions: Array<LiquidityMiningPosition>
  liquidityPosition?: Maybe<LiquidityPosition>
  liquidityPositionSnapshot?: Maybe<LiquidityPositionSnapshot>
  liquidityPositionSnapshots: Array<LiquidityPositionSnapshot>
  liquidityPositions: Array<LiquidityPosition>
  mint?: Maybe<Mint>
  mints: Array<Mint>
  monthlyUniqueAddressInteraction?: Maybe<MonthlyUniqueAddressInteraction>
  monthlyUniqueAddressInteractions: Array<MonthlyUniqueAddressInteraction>
  pair?: Maybe<Pair>
  pairDayData?: Maybe<PairDayData>
  pairDayDatas: Array<PairDayData>
  pairHourData?: Maybe<PairHourData>
  pairHourDatas: Array<PairHourData>
  pairs: Array<Pair>
  recoveries: Array<Recovery>
  recovery?: Maybe<Recovery>
  singleSidedStakingCampaign?: Maybe<SingleSidedStakingCampaign>
  singleSidedStakingCampaignClaim?: Maybe<SingleSidedStakingCampaignClaim>
  singleSidedStakingCampaignClaims: Array<SingleSidedStakingCampaignClaim>
  singleSidedStakingCampaignDeposit?: Maybe<SingleSidedStakingCampaignDeposit>
  singleSidedStakingCampaignDeposits: Array<SingleSidedStakingCampaignDeposit>
  singleSidedStakingCampaignPosition?: Maybe<SingleSidedStakingCampaignPosition>
  singleSidedStakingCampaignPositions: Array<SingleSidedStakingCampaignPosition>
  singleSidedStakingCampaignRecoveries: Array<SingleSidedStakingCampaignRecovery>
  singleSidedStakingCampaignRecovery?: Maybe<SingleSidedStakingCampaignRecovery>
  singleSidedStakingCampaignReward?: Maybe<SingleSidedStakingCampaignReward>
  singleSidedStakingCampaignRewards: Array<SingleSidedStakingCampaignReward>
  singleSidedStakingCampaignWithdrawal?: Maybe<SingleSidedStakingCampaignWithdrawal>
  singleSidedStakingCampaignWithdrawals: Array<SingleSidedStakingCampaignWithdrawal>
  singleSidedStakingCampaigns: Array<SingleSidedStakingCampaign>
  swap?: Maybe<Swap>
  swaprDayData?: Maybe<SwaprDayData>
  swaprDayDatas: Array<SwaprDayData>
  swaprFactories: Array<SwaprFactory>
  swaprFactory?: Maybe<SwaprFactory>
  swaprStakingRewardsFactories: Array<SwaprStakingRewardsFactory>
  swaprStakingRewardsFactory?: Maybe<SwaprStakingRewardsFactory>
  swaps: Array<Swap>
  token?: Maybe<Token>
  tokenDayData?: Maybe<TokenDayData>
  tokenDayDatas: Array<TokenDayData>
  tokens: Array<Token>
  transaction?: Maybe<Transaction>
  transactions: Array<Transaction>
  user?: Maybe<User>
  users: Array<User>
  weeklyUniqueAddressInteraction?: Maybe<WeeklyUniqueAddressInteraction>
  weeklyUniqueAddressInteractions: Array<WeeklyUniqueAddressInteraction>
  withdrawal?: Maybe<Withdrawal>
  withdrawals: Array<Withdrawal>
}

export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>
}

export type SubscriptionBundleArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionBundlesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Bundle_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Bundle_Filter>
}

export type SubscriptionBurnArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionBurnsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Burn_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Burn_Filter>
}

export type SubscriptionClaimArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionClaimsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Claim_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Claim_Filter>
}

export type SubscriptionDailyUniqueAddressInteractionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionDailyUniqueAddressInteractionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<DailyUniqueAddressInteraction_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<DailyUniqueAddressInteraction_Filter>
}

export type SubscriptionDepositArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionDepositsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Deposit_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Deposit_Filter>
}

export type SubscriptionLiquidityMiningCampaignArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionLiquidityMiningCampaignRewardArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionLiquidityMiningCampaignRewardsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityMiningCampaignReward_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<LiquidityMiningCampaignReward_Filter>
}

export type SubscriptionLiquidityMiningCampaignsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityMiningCampaign_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<LiquidityMiningCampaign_Filter>
}

export type SubscriptionLiquidityMiningPositionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionLiquidityMiningPositionSnapshotArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionLiquidityMiningPositionSnapshotsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityMiningPositionSnapshot_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<LiquidityMiningPositionSnapshot_Filter>
}

export type SubscriptionLiquidityMiningPositionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityMiningPosition_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<LiquidityMiningPosition_Filter>
}

export type SubscriptionLiquidityPositionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionLiquidityPositionSnapshotArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionLiquidityPositionSnapshotsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityPositionSnapshot_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<LiquidityPositionSnapshot_Filter>
}

export type SubscriptionLiquidityPositionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityPosition_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<LiquidityPosition_Filter>
}

export type SubscriptionMintArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionMintsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Mint_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Mint_Filter>
}

export type SubscriptionMonthlyUniqueAddressInteractionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionMonthlyUniqueAddressInteractionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<MonthlyUniqueAddressInteraction_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<MonthlyUniqueAddressInteraction_Filter>
}

export type SubscriptionPairArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionPairDayDataArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionPairDayDatasArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<PairDayData_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<PairDayData_Filter>
}

export type SubscriptionPairHourDataArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionPairHourDatasArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<PairHourData_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<PairHourData_Filter>
}

export type SubscriptionPairsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Pair_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Pair_Filter>
}

export type SubscriptionRecoveriesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Recovery_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Recovery_Filter>
}

export type SubscriptionRecoveryArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionSingleSidedStakingCampaignArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionSingleSidedStakingCampaignClaimArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionSingleSidedStakingCampaignClaimsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignClaim_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SingleSidedStakingCampaignClaim_Filter>
}

export type SubscriptionSingleSidedStakingCampaignDepositArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionSingleSidedStakingCampaignDepositsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignDeposit_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SingleSidedStakingCampaignDeposit_Filter>
}

export type SubscriptionSingleSidedStakingCampaignPositionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionSingleSidedStakingCampaignPositionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignPosition_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SingleSidedStakingCampaignPosition_Filter>
}

export type SubscriptionSingleSidedStakingCampaignRecoveriesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignRecovery_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SingleSidedStakingCampaignRecovery_Filter>
}

export type SubscriptionSingleSidedStakingCampaignRecoveryArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionSingleSidedStakingCampaignRewardArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionSingleSidedStakingCampaignRewardsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignReward_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SingleSidedStakingCampaignReward_Filter>
}

export type SubscriptionSingleSidedStakingCampaignWithdrawalArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionSingleSidedStakingCampaignWithdrawalsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaignWithdrawal_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SingleSidedStakingCampaignWithdrawal_Filter>
}

export type SubscriptionSingleSidedStakingCampaignsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SingleSidedStakingCampaign_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SingleSidedStakingCampaign_Filter>
}

export type SubscriptionSwapArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionSwaprDayDataArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionSwaprDayDatasArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SwaprDayData_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SwaprDayData_Filter>
}

export type SubscriptionSwaprFactoriesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SwaprFactory_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SwaprFactory_Filter>
}

export type SubscriptionSwaprFactoryArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionSwaprStakingRewardsFactoriesArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<SwaprStakingRewardsFactory_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<SwaprStakingRewardsFactory_Filter>
}

export type SubscriptionSwaprStakingRewardsFactoryArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionSwapsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Swap_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Swap_Filter>
}

export type SubscriptionTokenArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionTokenDayDataArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionTokenDayDatasArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<TokenDayData_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<TokenDayData_Filter>
}

export type SubscriptionTokensArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Token_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Token_Filter>
}

export type SubscriptionTransactionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionTransactionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Transaction_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Transaction_Filter>
}

export type SubscriptionUserArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionUsersArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<User_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<User_Filter>
}

export type SubscriptionWeeklyUniqueAddressInteractionArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionWeeklyUniqueAddressInteractionsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<WeeklyUniqueAddressInteraction_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<WeeklyUniqueAddressInteraction_Filter>
}

export type SubscriptionWithdrawalArgs = {
  block?: InputMaybe<Block_Height>
  id: Scalars['ID']
  subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionWithdrawalsArgs = {
  block?: InputMaybe<Block_Height>
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Withdrawal_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  subgraphError?: _SubgraphErrorPolicy_
  where?: InputMaybe<Withdrawal_Filter>
}

export type Swap = {
  __typename?: 'Swap'
  amount0In: Scalars['BigDecimal']
  amount0Out: Scalars['BigDecimal']
  amount1In: Scalars['BigDecimal']
  amount1Out: Scalars['BigDecimal']
  amountUSD: Scalars['BigDecimal']
  from: Scalars['Bytes']
  id: Scalars['ID']
  logIndex?: Maybe<Scalars['BigInt']>
  pair: Pair
  sender: Scalars['Bytes']
  timestamp: Scalars['BigInt']
  to: Scalars['Bytes']
  transaction: Transaction
}

export type Swap_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  amount0In?: InputMaybe<Scalars['BigDecimal']>
  amount0In_gt?: InputMaybe<Scalars['BigDecimal']>
  amount0In_gte?: InputMaybe<Scalars['BigDecimal']>
  amount0In_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount0In_lt?: InputMaybe<Scalars['BigDecimal']>
  amount0In_lte?: InputMaybe<Scalars['BigDecimal']>
  amount0In_not?: InputMaybe<Scalars['BigDecimal']>
  amount0In_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount0Out?: InputMaybe<Scalars['BigDecimal']>
  amount0Out_gt?: InputMaybe<Scalars['BigDecimal']>
  amount0Out_gte?: InputMaybe<Scalars['BigDecimal']>
  amount0Out_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount0Out_lt?: InputMaybe<Scalars['BigDecimal']>
  amount0Out_lte?: InputMaybe<Scalars['BigDecimal']>
  amount0Out_not?: InputMaybe<Scalars['BigDecimal']>
  amount0Out_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount1In?: InputMaybe<Scalars['BigDecimal']>
  amount1In_gt?: InputMaybe<Scalars['BigDecimal']>
  amount1In_gte?: InputMaybe<Scalars['BigDecimal']>
  amount1In_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount1In_lt?: InputMaybe<Scalars['BigDecimal']>
  amount1In_lte?: InputMaybe<Scalars['BigDecimal']>
  amount1In_not?: InputMaybe<Scalars['BigDecimal']>
  amount1In_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount1Out?: InputMaybe<Scalars['BigDecimal']>
  amount1Out_gt?: InputMaybe<Scalars['BigDecimal']>
  amount1Out_gte?: InputMaybe<Scalars['BigDecimal']>
  amount1Out_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount1Out_lt?: InputMaybe<Scalars['BigDecimal']>
  amount1Out_lte?: InputMaybe<Scalars['BigDecimal']>
  amount1Out_not?: InputMaybe<Scalars['BigDecimal']>
  amount1Out_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amountUSD?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amountUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_not?: InputMaybe<Scalars['BigDecimal']>
  amountUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  and?: InputMaybe<Array<InputMaybe<Swap_Filter>>>
  from?: InputMaybe<Scalars['Bytes']>
  from_contains?: InputMaybe<Scalars['Bytes']>
  from_gt?: InputMaybe<Scalars['Bytes']>
  from_gte?: InputMaybe<Scalars['Bytes']>
  from_in?: InputMaybe<Array<Scalars['Bytes']>>
  from_lt?: InputMaybe<Scalars['Bytes']>
  from_lte?: InputMaybe<Scalars['Bytes']>
  from_not?: InputMaybe<Scalars['Bytes']>
  from_not_contains?: InputMaybe<Scalars['Bytes']>
  from_not_in?: InputMaybe<Array<Scalars['Bytes']>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  logIndex?: InputMaybe<Scalars['BigInt']>
  logIndex_gt?: InputMaybe<Scalars['BigInt']>
  logIndex_gte?: InputMaybe<Scalars['BigInt']>
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>
  logIndex_lt?: InputMaybe<Scalars['BigInt']>
  logIndex_lte?: InputMaybe<Scalars['BigInt']>
  logIndex_not?: InputMaybe<Scalars['BigInt']>
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  or?: InputMaybe<Array<InputMaybe<Swap_Filter>>>
  pair?: InputMaybe<Scalars['String']>
  pair_?: InputMaybe<Pair_Filter>
  pair_contains?: InputMaybe<Scalars['String']>
  pair_contains_nocase?: InputMaybe<Scalars['String']>
  pair_ends_with?: InputMaybe<Scalars['String']>
  pair_ends_with_nocase?: InputMaybe<Scalars['String']>
  pair_gt?: InputMaybe<Scalars['String']>
  pair_gte?: InputMaybe<Scalars['String']>
  pair_in?: InputMaybe<Array<Scalars['String']>>
  pair_lt?: InputMaybe<Scalars['String']>
  pair_lte?: InputMaybe<Scalars['String']>
  pair_not?: InputMaybe<Scalars['String']>
  pair_not_contains?: InputMaybe<Scalars['String']>
  pair_not_contains_nocase?: InputMaybe<Scalars['String']>
  pair_not_ends_with?: InputMaybe<Scalars['String']>
  pair_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  pair_not_in?: InputMaybe<Array<Scalars['String']>>
  pair_not_starts_with?: InputMaybe<Scalars['String']>
  pair_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  pair_starts_with?: InputMaybe<Scalars['String']>
  pair_starts_with_nocase?: InputMaybe<Scalars['String']>
  sender?: InputMaybe<Scalars['Bytes']>
  sender_contains?: InputMaybe<Scalars['Bytes']>
  sender_gt?: InputMaybe<Scalars['Bytes']>
  sender_gte?: InputMaybe<Scalars['Bytes']>
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>
  sender_lt?: InputMaybe<Scalars['Bytes']>
  sender_lte?: InputMaybe<Scalars['Bytes']>
  sender_not?: InputMaybe<Scalars['Bytes']>
  sender_not_contains?: InputMaybe<Scalars['Bytes']>
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>
  timestamp?: InputMaybe<Scalars['BigInt']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']>
  timestamp_not?: InputMaybe<Scalars['BigInt']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  to?: InputMaybe<Scalars['Bytes']>
  to_contains?: InputMaybe<Scalars['Bytes']>
  to_gt?: InputMaybe<Scalars['Bytes']>
  to_gte?: InputMaybe<Scalars['Bytes']>
  to_in?: InputMaybe<Array<Scalars['Bytes']>>
  to_lt?: InputMaybe<Scalars['Bytes']>
  to_lte?: InputMaybe<Scalars['Bytes']>
  to_not?: InputMaybe<Scalars['Bytes']>
  to_not_contains?: InputMaybe<Scalars['Bytes']>
  to_not_in?: InputMaybe<Array<Scalars['Bytes']>>
  transaction?: InputMaybe<Scalars['String']>
  transaction_?: InputMaybe<Transaction_Filter>
  transaction_contains?: InputMaybe<Scalars['String']>
  transaction_contains_nocase?: InputMaybe<Scalars['String']>
  transaction_ends_with?: InputMaybe<Scalars['String']>
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']>
  transaction_gt?: InputMaybe<Scalars['String']>
  transaction_gte?: InputMaybe<Scalars['String']>
  transaction_in?: InputMaybe<Array<Scalars['String']>>
  transaction_lt?: InputMaybe<Scalars['String']>
  transaction_lte?: InputMaybe<Scalars['String']>
  transaction_not?: InputMaybe<Scalars['String']>
  transaction_not_contains?: InputMaybe<Scalars['String']>
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']>
  transaction_not_ends_with?: InputMaybe<Scalars['String']>
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  transaction_not_in?: InputMaybe<Array<Scalars['String']>>
  transaction_not_starts_with?: InputMaybe<Scalars['String']>
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  transaction_starts_with?: InputMaybe<Scalars['String']>
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum Swap_OrderBy {
  Amount0In = 'amount0In',
  Amount0Out = 'amount0Out',
  Amount1In = 'amount1In',
  Amount1Out = 'amount1Out',
  AmountUsd = 'amountUSD',
  From = 'from',
  Id = 'id',
  LogIndex = 'logIndex',
  Pair = 'pair',
  PairCreatedAtBlockNumber = 'pair__createdAtBlockNumber',
  PairCreatedAtTimestamp = 'pair__createdAtTimestamp',
  PairId = 'pair__id',
  PairLiquidityProviderCount = 'pair__liquidityProviderCount',
  PairReserve0 = 'pair__reserve0',
  PairReserve1 = 'pair__reserve1',
  PairReserveNativeCurrency = 'pair__reserveNativeCurrency',
  PairReserveUsd = 'pair__reserveUSD',
  PairSwapFee = 'pair__swapFee',
  PairToken0Price = 'pair__token0Price',
  PairToken1Price = 'pair__token1Price',
  PairTotalSupply = 'pair__totalSupply',
  PairTrackedReserveNativeCurrency = 'pair__trackedReserveNativeCurrency',
  PairTxCount = 'pair__txCount',
  PairUntrackedVolumeUsd = 'pair__untrackedVolumeUSD',
  PairVolumeToken0 = 'pair__volumeToken0',
  PairVolumeToken1 = 'pair__volumeToken1',
  PairVolumeUsd = 'pair__volumeUSD',
  Sender = 'sender',
  Timestamp = 'timestamp',
  To = 'to',
  Transaction = 'transaction',
  TransactionBlockNumber = 'transaction__blockNumber',
  TransactionId = 'transaction__id',
  TransactionTimestamp = 'transaction__timestamp',
}

export type SwaprDayData = {
  __typename?: 'SwaprDayData'
  dailyBurns: Scalars['BigInt']
  dailyMints: Scalars['BigInt']
  dailySwaps: Scalars['BigInt']
  dailyVolumeNativeCurrency: Scalars['BigDecimal']
  dailyVolumeUSD: Scalars['BigDecimal']
  dailyVolumeUntracked: Scalars['BigDecimal']
  date: Scalars['Int']
  id: Scalars['ID']
  totalLiquidityNativeCurrency: Scalars['BigDecimal']
  totalLiquidityUSD: Scalars['BigDecimal']
  totalVolumeNativeCurrency: Scalars['BigDecimal']
  totalVolumeUSD: Scalars['BigDecimal']
  txCount: Scalars['BigInt']
}

export type SwaprDayData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<SwaprDayData_Filter>>>
  dailyBurns?: InputMaybe<Scalars['BigInt']>
  dailyBurns_gt?: InputMaybe<Scalars['BigInt']>
  dailyBurns_gte?: InputMaybe<Scalars['BigInt']>
  dailyBurns_in?: InputMaybe<Array<Scalars['BigInt']>>
  dailyBurns_lt?: InputMaybe<Scalars['BigInt']>
  dailyBurns_lte?: InputMaybe<Scalars['BigInt']>
  dailyBurns_not?: InputMaybe<Scalars['BigInt']>
  dailyBurns_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  dailyMints?: InputMaybe<Scalars['BigInt']>
  dailyMints_gt?: InputMaybe<Scalars['BigInt']>
  dailyMints_gte?: InputMaybe<Scalars['BigInt']>
  dailyMints_in?: InputMaybe<Array<Scalars['BigInt']>>
  dailyMints_lt?: InputMaybe<Scalars['BigInt']>
  dailyMints_lte?: InputMaybe<Scalars['BigInt']>
  dailyMints_not?: InputMaybe<Scalars['BigInt']>
  dailyMints_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  dailySwaps?: InputMaybe<Scalars['BigInt']>
  dailySwaps_gt?: InputMaybe<Scalars['BigInt']>
  dailySwaps_gte?: InputMaybe<Scalars['BigInt']>
  dailySwaps_in?: InputMaybe<Array<Scalars['BigInt']>>
  dailySwaps_lt?: InputMaybe<Scalars['BigInt']>
  dailySwaps_lte?: InputMaybe<Scalars['BigInt']>
  dailySwaps_not?: InputMaybe<Scalars['BigInt']>
  dailySwaps_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  dailyVolumeNativeCurrency?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeNativeCurrency_gt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeNativeCurrency_gte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeNativeCurrency_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  dailyVolumeNativeCurrency_lt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeNativeCurrency_lte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeNativeCurrency_not?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeNativeCurrency_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  dailyVolumeUSD?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  dailyVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  dailyVolumeUntracked?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUntracked_gt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUntracked_gte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUntracked_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  dailyVolumeUntracked_lt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUntracked_lte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUntracked_not?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUntracked_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  date?: InputMaybe<Scalars['Int']>
  date_gt?: InputMaybe<Scalars['Int']>
  date_gte?: InputMaybe<Scalars['Int']>
  date_in?: InputMaybe<Array<Scalars['Int']>>
  date_lt?: InputMaybe<Scalars['Int']>
  date_lte?: InputMaybe<Scalars['Int']>
  date_not?: InputMaybe<Scalars['Int']>
  date_not_in?: InputMaybe<Array<Scalars['Int']>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  or?: InputMaybe<Array<InputMaybe<SwaprDayData_Filter>>>
  totalLiquidityNativeCurrency?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_gt?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_gte?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalLiquidityNativeCurrency_lt?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_lte?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_not?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalLiquidityUSD?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalLiquidityUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_not?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalVolumeNativeCurrency?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeNativeCurrency_gt?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeNativeCurrency_gte?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeNativeCurrency_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalVolumeNativeCurrency_lt?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeNativeCurrency_lte?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeNativeCurrency_not?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeNativeCurrency_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalVolumeUSD?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  txCount?: InputMaybe<Scalars['BigInt']>
  txCount_gt?: InputMaybe<Scalars['BigInt']>
  txCount_gte?: InputMaybe<Scalars['BigInt']>
  txCount_in?: InputMaybe<Array<Scalars['BigInt']>>
  txCount_lt?: InputMaybe<Scalars['BigInt']>
  txCount_lte?: InputMaybe<Scalars['BigInt']>
  txCount_not?: InputMaybe<Scalars['BigInt']>
  txCount_not_in?: InputMaybe<Array<Scalars['BigInt']>>
}

export enum SwaprDayData_OrderBy {
  DailyBurns = 'dailyBurns',
  DailyMints = 'dailyMints',
  DailySwaps = 'dailySwaps',
  DailyVolumeNativeCurrency = 'dailyVolumeNativeCurrency',
  DailyVolumeUsd = 'dailyVolumeUSD',
  DailyVolumeUntracked = 'dailyVolumeUntracked',
  Date = 'date',
  Id = 'id',
  TotalLiquidityNativeCurrency = 'totalLiquidityNativeCurrency',
  TotalLiquidityUsd = 'totalLiquidityUSD',
  TotalVolumeNativeCurrency = 'totalVolumeNativeCurrency',
  TotalVolumeUsd = 'totalVolumeUSD',
  TxCount = 'txCount',
}

export type SwaprFactory = {
  __typename?: 'SwaprFactory'
  id: Scalars['ID']
  pairCount: Scalars['Int']
  totalLiquidityNativeCurrency: Scalars['BigDecimal']
  totalLiquidityUSD: Scalars['BigDecimal']
  totalVolumeNativeCurrency: Scalars['BigDecimal']
  totalVolumeUSD: Scalars['BigDecimal']
  txCount: Scalars['BigInt']
  untrackedVolumeUSD: Scalars['BigDecimal']
}

export type SwaprFactory_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<SwaprFactory_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  or?: InputMaybe<Array<InputMaybe<SwaprFactory_Filter>>>
  pairCount?: InputMaybe<Scalars['Int']>
  pairCount_gt?: InputMaybe<Scalars['Int']>
  pairCount_gte?: InputMaybe<Scalars['Int']>
  pairCount_in?: InputMaybe<Array<Scalars['Int']>>
  pairCount_lt?: InputMaybe<Scalars['Int']>
  pairCount_lte?: InputMaybe<Scalars['Int']>
  pairCount_not?: InputMaybe<Scalars['Int']>
  pairCount_not_in?: InputMaybe<Array<Scalars['Int']>>
  totalLiquidityNativeCurrency?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_gt?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_gte?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalLiquidityNativeCurrency_lt?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_lte?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_not?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalLiquidityUSD?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalLiquidityUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_not?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalVolumeNativeCurrency?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeNativeCurrency_gt?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeNativeCurrency_gte?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeNativeCurrency_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalVolumeNativeCurrency_lt?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeNativeCurrency_lte?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeNativeCurrency_not?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeNativeCurrency_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalVolumeUSD?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']>
  totalVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  txCount?: InputMaybe<Scalars['BigInt']>
  txCount_gt?: InputMaybe<Scalars['BigInt']>
  txCount_gte?: InputMaybe<Scalars['BigInt']>
  txCount_in?: InputMaybe<Array<Scalars['BigInt']>>
  txCount_lt?: InputMaybe<Scalars['BigInt']>
  txCount_lte?: InputMaybe<Scalars['BigInt']>
  txCount_not?: InputMaybe<Scalars['BigInt']>
  txCount_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  untrackedVolumeUSD?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  untrackedVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
}

export enum SwaprFactory_OrderBy {
  Id = 'id',
  PairCount = 'pairCount',
  TotalLiquidityNativeCurrency = 'totalLiquidityNativeCurrency',
  TotalLiquidityUsd = 'totalLiquidityUSD',
  TotalVolumeNativeCurrency = 'totalVolumeNativeCurrency',
  TotalVolumeUsd = 'totalVolumeUSD',
  TxCount = 'txCount',
  UntrackedVolumeUsd = 'untrackedVolumeUSD',
}

export type SwaprStakingRewardsFactory = {
  __typename?: 'SwaprStakingRewardsFactory'
  id: Scalars['ID']
  initializedCampaignsCount: Scalars['Int']
}

export type SwaprStakingRewardsFactory_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<SwaprStakingRewardsFactory_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  initializedCampaignsCount?: InputMaybe<Scalars['Int']>
  initializedCampaignsCount_gt?: InputMaybe<Scalars['Int']>
  initializedCampaignsCount_gte?: InputMaybe<Scalars['Int']>
  initializedCampaignsCount_in?: InputMaybe<Array<Scalars['Int']>>
  initializedCampaignsCount_lt?: InputMaybe<Scalars['Int']>
  initializedCampaignsCount_lte?: InputMaybe<Scalars['Int']>
  initializedCampaignsCount_not?: InputMaybe<Scalars['Int']>
  initializedCampaignsCount_not_in?: InputMaybe<Array<Scalars['Int']>>
  or?: InputMaybe<Array<InputMaybe<SwaprStakingRewardsFactory_Filter>>>
}

export enum SwaprStakingRewardsFactory_OrderBy {
  Id = 'id',
  InitializedCampaignsCount = 'initializedCampaignsCount',
}

export type Token = {
  __typename?: 'Token'
  decimals: Scalars['BigInt']
  derivedNativeCurrency: Scalars['BigDecimal']
  id: Scalars['ID']
  name: Scalars['String']
  pairBase: Array<Pair>
  pairDayDataBase: Array<PairDayData>
  pairDayDataQuote: Array<PairDayData>
  pairQuote: Array<Pair>
  symbol: Scalars['String']
  tokenDayData: Array<TokenDayData>
  totalLiquidity: Scalars['BigDecimal']
  totalSupply: Scalars['BigInt']
  tradeVolume: Scalars['BigDecimal']
  tradeVolumeUSD: Scalars['BigDecimal']
  txCount: Scalars['BigInt']
  untrackedVolumeUSD: Scalars['BigDecimal']
  whitelistPairs: Array<Pair>
}

export type TokenPairBaseArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Pair_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<Pair_Filter>
}

export type TokenPairDayDataBaseArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<PairDayData_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<PairDayData_Filter>
}

export type TokenPairDayDataQuoteArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<PairDayData_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<PairDayData_Filter>
}

export type TokenPairQuoteArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Pair_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<Pair_Filter>
}

export type TokenTokenDayDataArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<TokenDayData_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<TokenDayData_Filter>
}

export type TokenWhitelistPairsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Pair_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<Pair_Filter>
}

export type TokenDayData = {
  __typename?: 'TokenDayData'
  dailyTxns: Scalars['BigInt']
  dailyVolumeNativeCurrency: Scalars['BigDecimal']
  dailyVolumeToken: Scalars['BigDecimal']
  dailyVolumeUSD: Scalars['BigDecimal']
  date: Scalars['Int']
  id: Scalars['ID']
  priceUSD: Scalars['BigDecimal']
  token: Token
  totalLiquidityNativeCurrency: Scalars['BigDecimal']
  totalLiquidityToken: Scalars['BigDecimal']
  totalLiquidityUSD: Scalars['BigDecimal']
}

export type TokenDayData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<TokenDayData_Filter>>>
  dailyTxns?: InputMaybe<Scalars['BigInt']>
  dailyTxns_gt?: InputMaybe<Scalars['BigInt']>
  dailyTxns_gte?: InputMaybe<Scalars['BigInt']>
  dailyTxns_in?: InputMaybe<Array<Scalars['BigInt']>>
  dailyTxns_lt?: InputMaybe<Scalars['BigInt']>
  dailyTxns_lte?: InputMaybe<Scalars['BigInt']>
  dailyTxns_not?: InputMaybe<Scalars['BigInt']>
  dailyTxns_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  dailyVolumeNativeCurrency?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeNativeCurrency_gt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeNativeCurrency_gte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeNativeCurrency_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  dailyVolumeNativeCurrency_lt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeNativeCurrency_lte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeNativeCurrency_not?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeNativeCurrency_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  dailyVolumeToken?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken_gt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken_gte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  dailyVolumeToken_lt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken_lte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken_not?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeToken_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  dailyVolumeUSD?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  dailyVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']>
  dailyVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  date?: InputMaybe<Scalars['Int']>
  date_gt?: InputMaybe<Scalars['Int']>
  date_gte?: InputMaybe<Scalars['Int']>
  date_in?: InputMaybe<Array<Scalars['Int']>>
  date_lt?: InputMaybe<Scalars['Int']>
  date_lte?: InputMaybe<Scalars['Int']>
  date_not?: InputMaybe<Scalars['Int']>
  date_not_in?: InputMaybe<Array<Scalars['Int']>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  or?: InputMaybe<Array<InputMaybe<TokenDayData_Filter>>>
  priceUSD?: InputMaybe<Scalars['BigDecimal']>
  priceUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  priceUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  priceUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  priceUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  priceUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  priceUSD_not?: InputMaybe<Scalars['BigDecimal']>
  priceUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  token?: InputMaybe<Scalars['String']>
  token_?: InputMaybe<Token_Filter>
  token_contains?: InputMaybe<Scalars['String']>
  token_contains_nocase?: InputMaybe<Scalars['String']>
  token_ends_with?: InputMaybe<Scalars['String']>
  token_ends_with_nocase?: InputMaybe<Scalars['String']>
  token_gt?: InputMaybe<Scalars['String']>
  token_gte?: InputMaybe<Scalars['String']>
  token_in?: InputMaybe<Array<Scalars['String']>>
  token_lt?: InputMaybe<Scalars['String']>
  token_lte?: InputMaybe<Scalars['String']>
  token_not?: InputMaybe<Scalars['String']>
  token_not_contains?: InputMaybe<Scalars['String']>
  token_not_contains_nocase?: InputMaybe<Scalars['String']>
  token_not_ends_with?: InputMaybe<Scalars['String']>
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  token_not_in?: InputMaybe<Array<Scalars['String']>>
  token_not_starts_with?: InputMaybe<Scalars['String']>
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  token_starts_with?: InputMaybe<Scalars['String']>
  token_starts_with_nocase?: InputMaybe<Scalars['String']>
  totalLiquidityNativeCurrency?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_gt?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_gte?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalLiquidityNativeCurrency_lt?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_lte?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_not?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityNativeCurrency_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalLiquidityToken?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityToken_gt?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityToken_gte?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityToken_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalLiquidityToken_lt?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityToken_lte?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityToken_not?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityToken_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalLiquidityUSD?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalLiquidityUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_not?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidityUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
}

export enum TokenDayData_OrderBy {
  DailyTxns = 'dailyTxns',
  DailyVolumeNativeCurrency = 'dailyVolumeNativeCurrency',
  DailyVolumeToken = 'dailyVolumeToken',
  DailyVolumeUsd = 'dailyVolumeUSD',
  Date = 'date',
  Id = 'id',
  PriceUsd = 'priceUSD',
  Token = 'token',
  TokenDecimals = 'token__decimals',
  TokenDerivedNativeCurrency = 'token__derivedNativeCurrency',
  TokenId = 'token__id',
  TokenName = 'token__name',
  TokenSymbol = 'token__symbol',
  TokenTotalLiquidity = 'token__totalLiquidity',
  TokenTotalSupply = 'token__totalSupply',
  TokenTradeVolume = 'token__tradeVolume',
  TokenTradeVolumeUsd = 'token__tradeVolumeUSD',
  TokenTxCount = 'token__txCount',
  TokenUntrackedVolumeUsd = 'token__untrackedVolumeUSD',
  TotalLiquidityNativeCurrency = 'totalLiquidityNativeCurrency',
  TotalLiquidityToken = 'totalLiquidityToken',
  TotalLiquidityUsd = 'totalLiquidityUSD',
}

export type Token_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<Token_Filter>>>
  decimals?: InputMaybe<Scalars['BigInt']>
  decimals_gt?: InputMaybe<Scalars['BigInt']>
  decimals_gte?: InputMaybe<Scalars['BigInt']>
  decimals_in?: InputMaybe<Array<Scalars['BigInt']>>
  decimals_lt?: InputMaybe<Scalars['BigInt']>
  decimals_lte?: InputMaybe<Scalars['BigInt']>
  decimals_not?: InputMaybe<Scalars['BigInt']>
  decimals_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  derivedNativeCurrency?: InputMaybe<Scalars['BigDecimal']>
  derivedNativeCurrency_gt?: InputMaybe<Scalars['BigDecimal']>
  derivedNativeCurrency_gte?: InputMaybe<Scalars['BigDecimal']>
  derivedNativeCurrency_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  derivedNativeCurrency_lt?: InputMaybe<Scalars['BigDecimal']>
  derivedNativeCurrency_lte?: InputMaybe<Scalars['BigDecimal']>
  derivedNativeCurrency_not?: InputMaybe<Scalars['BigDecimal']>
  derivedNativeCurrency_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  name?: InputMaybe<Scalars['String']>
  name_contains?: InputMaybe<Scalars['String']>
  name_contains_nocase?: InputMaybe<Scalars['String']>
  name_ends_with?: InputMaybe<Scalars['String']>
  name_ends_with_nocase?: InputMaybe<Scalars['String']>
  name_gt?: InputMaybe<Scalars['String']>
  name_gte?: InputMaybe<Scalars['String']>
  name_in?: InputMaybe<Array<Scalars['String']>>
  name_lt?: InputMaybe<Scalars['String']>
  name_lte?: InputMaybe<Scalars['String']>
  name_not?: InputMaybe<Scalars['String']>
  name_not_contains?: InputMaybe<Scalars['String']>
  name_not_contains_nocase?: InputMaybe<Scalars['String']>
  name_not_ends_with?: InputMaybe<Scalars['String']>
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  name_not_in?: InputMaybe<Array<Scalars['String']>>
  name_not_starts_with?: InputMaybe<Scalars['String']>
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  name_starts_with?: InputMaybe<Scalars['String']>
  name_starts_with_nocase?: InputMaybe<Scalars['String']>
  or?: InputMaybe<Array<InputMaybe<Token_Filter>>>
  pairBase_?: InputMaybe<Pair_Filter>
  pairDayDataBase_?: InputMaybe<PairDayData_Filter>
  pairDayDataQuote_?: InputMaybe<PairDayData_Filter>
  pairQuote_?: InputMaybe<Pair_Filter>
  symbol?: InputMaybe<Scalars['String']>
  symbol_contains?: InputMaybe<Scalars['String']>
  symbol_contains_nocase?: InputMaybe<Scalars['String']>
  symbol_ends_with?: InputMaybe<Scalars['String']>
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']>
  symbol_gt?: InputMaybe<Scalars['String']>
  symbol_gte?: InputMaybe<Scalars['String']>
  symbol_in?: InputMaybe<Array<Scalars['String']>>
  symbol_lt?: InputMaybe<Scalars['String']>
  symbol_lte?: InputMaybe<Scalars['String']>
  symbol_not?: InputMaybe<Scalars['String']>
  symbol_not_contains?: InputMaybe<Scalars['String']>
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']>
  symbol_not_ends_with?: InputMaybe<Scalars['String']>
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  symbol_not_in?: InputMaybe<Array<Scalars['String']>>
  symbol_not_starts_with?: InputMaybe<Scalars['String']>
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  symbol_starts_with?: InputMaybe<Scalars['String']>
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']>
  tokenDayData_?: InputMaybe<TokenDayData_Filter>
  totalLiquidity?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidity_gt?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidity_gte?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidity_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalLiquidity_lt?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidity_lte?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidity_not?: InputMaybe<Scalars['BigDecimal']>
  totalLiquidity_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  totalSupply?: InputMaybe<Scalars['BigInt']>
  totalSupply_gt?: InputMaybe<Scalars['BigInt']>
  totalSupply_gte?: InputMaybe<Scalars['BigInt']>
  totalSupply_in?: InputMaybe<Array<Scalars['BigInt']>>
  totalSupply_lt?: InputMaybe<Scalars['BigInt']>
  totalSupply_lte?: InputMaybe<Scalars['BigInt']>
  totalSupply_not?: InputMaybe<Scalars['BigInt']>
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  tradeVolume?: InputMaybe<Scalars['BigDecimal']>
  tradeVolumeUSD?: InputMaybe<Scalars['BigDecimal']>
  tradeVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  tradeVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  tradeVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  tradeVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  tradeVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  tradeVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']>
  tradeVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  tradeVolume_gt?: InputMaybe<Scalars['BigDecimal']>
  tradeVolume_gte?: InputMaybe<Scalars['BigDecimal']>
  tradeVolume_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  tradeVolume_lt?: InputMaybe<Scalars['BigDecimal']>
  tradeVolume_lte?: InputMaybe<Scalars['BigDecimal']>
  tradeVolume_not?: InputMaybe<Scalars['BigDecimal']>
  tradeVolume_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  txCount?: InputMaybe<Scalars['BigInt']>
  txCount_gt?: InputMaybe<Scalars['BigInt']>
  txCount_gte?: InputMaybe<Scalars['BigInt']>
  txCount_in?: InputMaybe<Array<Scalars['BigInt']>>
  txCount_lt?: InputMaybe<Scalars['BigInt']>
  txCount_lte?: InputMaybe<Scalars['BigInt']>
  txCount_not?: InputMaybe<Scalars['BigInt']>
  txCount_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  untrackedVolumeUSD?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  untrackedVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']>
  untrackedVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  whitelistPairs?: InputMaybe<Array<Scalars['String']>>
  whitelistPairs_?: InputMaybe<Pair_Filter>
  whitelistPairs_contains?: InputMaybe<Array<Scalars['String']>>
  whitelistPairs_contains_nocase?: InputMaybe<Array<Scalars['String']>>
  whitelistPairs_not?: InputMaybe<Array<Scalars['String']>>
  whitelistPairs_not_contains?: InputMaybe<Array<Scalars['String']>>
  whitelistPairs_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
}

export enum Token_OrderBy {
  Decimals = 'decimals',
  DerivedNativeCurrency = 'derivedNativeCurrency',
  Id = 'id',
  Name = 'name',
  PairBase = 'pairBase',
  PairDayDataBase = 'pairDayDataBase',
  PairDayDataQuote = 'pairDayDataQuote',
  PairQuote = 'pairQuote',
  Symbol = 'symbol',
  TokenDayData = 'tokenDayData',
  TotalLiquidity = 'totalLiquidity',
  TotalSupply = 'totalSupply',
  TradeVolume = 'tradeVolume',
  TradeVolumeUsd = 'tradeVolumeUSD',
  TxCount = 'txCount',
  UntrackedVolumeUsd = 'untrackedVolumeUSD',
  WhitelistPairs = 'whitelistPairs',
}

export type Transaction = {
  __typename?: 'Transaction'
  blockNumber: Scalars['BigInt']
  burns: Array<Burn>
  id: Scalars['ID']
  mints: Array<Mint>
  swaps: Array<Swap>
  timestamp: Scalars['BigInt']
}

export type TransactionBurnsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Burn_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<Burn_Filter>
}

export type TransactionMintsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Mint_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<Mint_Filter>
}

export type TransactionSwapsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<Swap_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<Swap_Filter>
}

export type Transaction_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<Transaction_Filter>>>
  blockNumber?: InputMaybe<Scalars['BigInt']>
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>
  blockNumber_not?: InputMaybe<Scalars['BigInt']>
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  burns?: InputMaybe<Array<Scalars['String']>>
  burns_?: InputMaybe<Burn_Filter>
  burns_contains?: InputMaybe<Array<Scalars['String']>>
  burns_contains_nocase?: InputMaybe<Array<Scalars['String']>>
  burns_not?: InputMaybe<Array<Scalars['String']>>
  burns_not_contains?: InputMaybe<Array<Scalars['String']>>
  burns_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  mints?: InputMaybe<Array<Scalars['String']>>
  mints_?: InputMaybe<Mint_Filter>
  mints_contains?: InputMaybe<Array<Scalars['String']>>
  mints_contains_nocase?: InputMaybe<Array<Scalars['String']>>
  mints_not?: InputMaybe<Array<Scalars['String']>>
  mints_not_contains?: InputMaybe<Array<Scalars['String']>>
  mints_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
  or?: InputMaybe<Array<InputMaybe<Transaction_Filter>>>
  swaps?: InputMaybe<Array<Scalars['String']>>
  swaps_?: InputMaybe<Swap_Filter>
  swaps_contains?: InputMaybe<Array<Scalars['String']>>
  swaps_contains_nocase?: InputMaybe<Array<Scalars['String']>>
  swaps_not?: InputMaybe<Array<Scalars['String']>>
  swaps_not_contains?: InputMaybe<Array<Scalars['String']>>
  swaps_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
  timestamp?: InputMaybe<Scalars['BigInt']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']>
  timestamp_not?: InputMaybe<Scalars['BigInt']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>
}

export enum Transaction_OrderBy {
  BlockNumber = 'blockNumber',
  Burns = 'burns',
  Id = 'id',
  Mints = 'mints',
  Swaps = 'swaps',
  Timestamp = 'timestamp',
}

export type User = {
  __typename?: 'User'
  id: Scalars['ID']
  liquidityPositions?: Maybe<Array<LiquidityPosition>>
  usdSwapped: Scalars['BigDecimal']
}

export type UserLiquidityPositionsArgs = {
  first?: InputMaybe<Scalars['Int']>
  orderBy?: InputMaybe<LiquidityPosition_OrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<LiquidityPosition_Filter>
}

export type User_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  and?: InputMaybe<Array<InputMaybe<User_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  liquidityPositions_?: InputMaybe<LiquidityPosition_Filter>
  or?: InputMaybe<Array<InputMaybe<User_Filter>>>
  usdSwapped?: InputMaybe<Scalars['BigDecimal']>
  usdSwapped_gt?: InputMaybe<Scalars['BigDecimal']>
  usdSwapped_gte?: InputMaybe<Scalars['BigDecimal']>
  usdSwapped_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  usdSwapped_lt?: InputMaybe<Scalars['BigDecimal']>
  usdSwapped_lte?: InputMaybe<Scalars['BigDecimal']>
  usdSwapped_not?: InputMaybe<Scalars['BigDecimal']>
  usdSwapped_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
}

export enum User_OrderBy {
  Id = 'id',
  LiquidityPositions = 'liquidityPositions',
  UsdSwapped = 'usdSwapped',
}

export type WeeklyUniqueAddressInteraction = {
  __typename?: 'WeeklyUniqueAddressInteraction'
  addresses: Array<Scalars['Bytes']>
  id: Scalars['ID']
  timestampEnd: Scalars['Int']
  timestampStart: Scalars['Int']
}

export type WeeklyUniqueAddressInteraction_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  addresses?: InputMaybe<Array<Scalars['Bytes']>>
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>
  and?: InputMaybe<Array<InputMaybe<WeeklyUniqueAddressInteraction_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  or?: InputMaybe<Array<InputMaybe<WeeklyUniqueAddressInteraction_Filter>>>
  timestampEnd?: InputMaybe<Scalars['Int']>
  timestampEnd_gt?: InputMaybe<Scalars['Int']>
  timestampEnd_gte?: InputMaybe<Scalars['Int']>
  timestampEnd_in?: InputMaybe<Array<Scalars['Int']>>
  timestampEnd_lt?: InputMaybe<Scalars['Int']>
  timestampEnd_lte?: InputMaybe<Scalars['Int']>
  timestampEnd_not?: InputMaybe<Scalars['Int']>
  timestampEnd_not_in?: InputMaybe<Array<Scalars['Int']>>
  timestampStart?: InputMaybe<Scalars['Int']>
  timestampStart_gt?: InputMaybe<Scalars['Int']>
  timestampStart_gte?: InputMaybe<Scalars['Int']>
  timestampStart_in?: InputMaybe<Array<Scalars['Int']>>
  timestampStart_lt?: InputMaybe<Scalars['Int']>
  timestampStart_lte?: InputMaybe<Scalars['Int']>
  timestampStart_not?: InputMaybe<Scalars['Int']>
  timestampStart_not_in?: InputMaybe<Array<Scalars['Int']>>
}

export enum WeeklyUniqueAddressInteraction_OrderBy {
  Addresses = 'addresses',
  Id = 'id',
  TimestampEnd = 'timestampEnd',
  TimestampStart = 'timestampStart',
}

export type Withdrawal = {
  __typename?: 'Withdrawal'
  amount: Scalars['BigDecimal']
  id: Scalars['ID']
  liquidityMiningCampaign: LiquidityMiningCampaign
  timestamp: Scalars['BigInt']
  user: Scalars['Bytes']
}

export type Withdrawal_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>
  amount?: InputMaybe<Scalars['BigDecimal']>
  amount_gt?: InputMaybe<Scalars['BigDecimal']>
  amount_gte?: InputMaybe<Scalars['BigDecimal']>
  amount_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  amount_lt?: InputMaybe<Scalars['BigDecimal']>
  amount_lte?: InputMaybe<Scalars['BigDecimal']>
  amount_not?: InputMaybe<Scalars['BigDecimal']>
  amount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
  and?: InputMaybe<Array<InputMaybe<Withdrawal_Filter>>>
  id?: InputMaybe<Scalars['ID']>
  id_gt?: InputMaybe<Scalars['ID']>
  id_gte?: InputMaybe<Scalars['ID']>
  id_in?: InputMaybe<Array<Scalars['ID']>>
  id_lt?: InputMaybe<Scalars['ID']>
  id_lte?: InputMaybe<Scalars['ID']>
  id_not?: InputMaybe<Scalars['ID']>
  id_not_in?: InputMaybe<Array<Scalars['ID']>>
  liquidityMiningCampaign?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_?: InputMaybe<LiquidityMiningCampaign_Filter>
  liquidityMiningCampaign_contains?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_contains_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_ends_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_ends_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_gt?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_gte?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_in?: InputMaybe<Array<Scalars['String']>>
  liquidityMiningCampaign_lt?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_lte?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_contains?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_contains_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_ends_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_ends_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_in?: InputMaybe<Array<Scalars['String']>>
  liquidityMiningCampaign_not_starts_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_not_starts_with_nocase?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_starts_with?: InputMaybe<Scalars['String']>
  liquidityMiningCampaign_starts_with_nocase?: InputMaybe<Scalars['String']>
  or?: InputMaybe<Array<InputMaybe<Withdrawal_Filter>>>
  timestamp?: InputMaybe<Scalars['BigInt']>
  timestamp_gt?: InputMaybe<Scalars['BigInt']>
  timestamp_gte?: InputMaybe<Scalars['BigInt']>
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>
  timestamp_lt?: InputMaybe<Scalars['BigInt']>
  timestamp_lte?: InputMaybe<Scalars['BigInt']>
  timestamp_not?: InputMaybe<Scalars['BigInt']>
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>
  user?: InputMaybe<Scalars['Bytes']>
  user_contains?: InputMaybe<Scalars['Bytes']>
  user_gt?: InputMaybe<Scalars['Bytes']>
  user_gte?: InputMaybe<Scalars['Bytes']>
  user_in?: InputMaybe<Array<Scalars['Bytes']>>
  user_lt?: InputMaybe<Scalars['Bytes']>
  user_lte?: InputMaybe<Scalars['Bytes']>
  user_not?: InputMaybe<Scalars['Bytes']>
  user_not_contains?: InputMaybe<Scalars['Bytes']>
  user_not_in?: InputMaybe<Array<Scalars['Bytes']>>
}

export enum Withdrawal_OrderBy {
  Amount = 'amount',
  Id = 'id',
  LiquidityMiningCampaign = 'liquidityMiningCampaign',
  LiquidityMiningCampaignDuration = 'liquidityMiningCampaign__duration',
  LiquidityMiningCampaignEndsAt = 'liquidityMiningCampaign__endsAt',
  LiquidityMiningCampaignId = 'liquidityMiningCampaign__id',
  LiquidityMiningCampaignInitialized = 'liquidityMiningCampaign__initialized',
  LiquidityMiningCampaignLocked = 'liquidityMiningCampaign__locked',
  LiquidityMiningCampaignOwner = 'liquidityMiningCampaign__owner',
  LiquidityMiningCampaignStakedAmount = 'liquidityMiningCampaign__stakedAmount',
  LiquidityMiningCampaignStakingCap = 'liquidityMiningCampaign__stakingCap',
  LiquidityMiningCampaignStartsAt = 'liquidityMiningCampaign__startsAt',
  Timestamp = 'timestamp',
  User = 'user',
}

export type _Block_ = {
  __typename?: '_Block_'
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>
  /** The block number */
  number: Scalars['Int']
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']>
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>
}

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_'
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_
  /** The deployment ID */
  deployment: Scalars['String']
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']
}

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny',
}

export type GetBundleQueryVariables = Exact<{ [key: string]: never }>

export type GetBundleQuery = {
  __typename?: 'Query'
  bundle?: { __typename?: 'Bundle'; nativeCurrencyPrice: any } | null
}

export type GetDerivedNativeCurrencyTokensQueryVariables = Exact<{
  tokenIds: Array<Scalars['ID']> | Scalars['ID']
}>

export type GetDerivedNativeCurrencyTokensQuery = {
  __typename?: 'Query'
  tokens: Array<{ __typename?: 'Token'; derivedNativeCurrency: any; address: string }>
}

export type GetLiquidityMiningCampaignQueryVariables = Exact<{
  liquidityMiningCampaignId: Scalars['ID']
}>

export type GetLiquidityMiningCampaignQuery = {
  __typename?: 'Query'
  liquidityMiningCampaign?: {
    __typename?: 'LiquidityMiningCampaign'
    duration: any
    startsAt: any
    endsAt: any
    locked: boolean
    stakingCap: any
    stakedAmount: any
    address: string
    rewards: Array<{
      __typename?: 'LiquidityMiningCampaignReward'
      amount: any
      token: {
        __typename?: 'Token'
        name: string
        symbol: string
        decimals: any
        derivedNativeCurrency: any
        address: string
      }
    }>
  } | null
}

export type GetLiquidityMiningCampaignsQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['String']>
}>

export type GetLiquidityMiningCampaignsQuery = {
  __typename?: 'Query'
  liquidityMiningCampaigns: Array<{
    __typename?: 'LiquidityMiningCampaign'
    duration: any
    startsAt: any
    endsAt: any
    locked: boolean
    stakingCap: any
    stakedAmount: any
    address: string
    rewards: Array<{
      __typename?: 'LiquidityMiningCampaignReward'
      amount: any
      token: {
        __typename?: 'Token'
        name: string
        symbol: string
        decimals: any
        derivedNativeCurrency: any
        address: string
      }
    }>
    stakablePair: {
      __typename?: 'Pair'
      id: string
      reserveNativeCurrency: any
      reserveUSD: any
      totalSupply: any
      reserve0: any
      reserve1: any
      token0: {
        __typename?: 'Token'
        name: string
        symbol: string
        decimals: any
        derivedNativeCurrency: any
        address: string
      }
      token1: {
        __typename?: 'Token'
        name: string
        symbol: string
        decimals: any
        derivedNativeCurrency: any
        address: string
      }
    }
    liquidityMiningPositions: Array<{ __typename?: 'LiquidityMiningPosition'; id: string }>
  }>
}

export type GetPairQueryVariables = Exact<{
  pairId: Scalars['ID']
}>

export type GetPairQuery = {
  __typename?: 'Query'
  pair?: {
    __typename?: 'Pair'
    id: string
    reserveNativeCurrency: any
    reserveUSD: any
    totalSupply: any
    reserve0: any
    reserve1: any
    token0: { __typename?: 'Token'; derivedNativeCurrency: any }
    token1: { __typename?: 'Token'; derivedNativeCurrency: any }
  } | null
}

export type GetPairLiquidityMiningCampaingsQueryVariables = Exact<{
  endsAtLowerLimit: Scalars['BigInt']
  pairId: Scalars['ID']
}>

export type GetPairLiquidityMiningCampaingsQuery = {
  __typename?: 'Query'
  pair?: {
    __typename?: 'Pair'
    reserveNativeCurrency: any
    reserveUSD: any
    totalSupply: any
    reserve0: any
    reserve1: any
    address: string
    token0: {
      __typename?: 'Token'
      name: string
      symbol: string
      decimals: any
      derivedNativeCurrency: any
      address: string
    }
    token1: {
      __typename?: 'Token'
      name: string
      symbol: string
      decimals: any
      derivedNativeCurrency: any
      address: string
    }
    liquidityMiningCampaigns: Array<{
      __typename?: 'LiquidityMiningCampaign'
      duration: any
      startsAt: any
      endsAt: any
      locked: boolean
      stakingCap: any
      stakedAmount: any
      address: string
      rewards: Array<{
        __typename?: 'LiquidityMiningCampaignReward'
        amount: any
        token: {
          __typename?: 'Token'
          name: string
          symbol: string
          decimals: any
          derivedNativeCurrency: any
          address: string
        }
      }>
    }>
  } | null
}

export type GetPairsQueryVariables = Exact<{ [key: string]: never }>

export type GetPairsQuery = {
  __typename?: 'Query'
  pairs: Array<{
    __typename?: 'Pair'
    reserve0: any
    reserve1: any
    token0: {
      __typename?: 'Token'
      name: string
      symbol: string
      decimals: any
      derivedNativeCurrency: any
      address: string
    }
    token1: {
      __typename?: 'Token'
      name: string
      symbol: string
      decimals: any
      derivedNativeCurrency: any
      address: string
    }
  }>
}

export type GetSingleSidedStakingCampaignQueryVariables = Exact<{
  campaignId: Scalars['ID']
}>

export type GetSingleSidedStakingCampaignQuery = {
  __typename?: 'Query'
  singleSidedStakingCampaign?: {
    __typename?: 'SingleSidedStakingCampaign'
    id: string
    owner: any
    duration: any
    startsAt: any
    endsAt: any
    locked: boolean
    stakingCap: any
    stakedAmount: any
    stakeToken: {
      __typename?: 'Token'
      id: string
      symbol: string
      name: string
      decimals: any
      totalSupply: any
      derivedNativeCurrency: any
    }
    rewards: Array<{
      __typename?: 'SingleSidedStakingCampaignReward'
      amount: any
      token: {
        __typename?: 'Token'
        name: string
        symbol: string
        decimals: any
        derivedNativeCurrency: any
        address: string
      }
    }>
  } | null
}

export type GetSingleSidedStakingCampaignsQueryVariables = Exact<{
  stakeTokenId?: InputMaybe<Scalars['String']>
  userId?: InputMaybe<Scalars['String']>
}>

export type GetSingleSidedStakingCampaignsQuery = {
  __typename?: 'Query'
  singleSidedStakingCampaigns: Array<{
    __typename?: 'SingleSidedStakingCampaign'
    id: string
    owner: any
    duration: any
    startsAt: any
    endsAt: any
    locked: boolean
    stakingCap: any
    stakedAmount: any
    stakeToken: {
      __typename?: 'Token'
      id: string
      symbol: string
      name: string
      decimals: any
      totalSupply: any
      derivedNativeCurrency: any
    }
    rewards: Array<{
      __typename?: 'SingleSidedStakingCampaignReward'
      amount: any
      token: {
        __typename?: 'Token'
        name: string
        symbol: string
        decimals: any
        derivedNativeCurrency: any
        address: string
      }
    }>
    singleSidedStakingPositions: Array<{
      __typename?: 'SingleSidedStakingCampaignPosition'
      id: string
      stakedAmount: any
    }>
  }>
}

export type GetStakingCampaignsQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['String']>
}>

export type GetStakingCampaignsQuery = {
  __typename?: 'Query'
  singleSidedStakingCampaigns: Array<{
    __typename?: 'SingleSidedStakingCampaign'
    id: string
    owner: any
    duration: any
    startsAt: any
    endsAt: any
    locked: boolean
    stakingCap: any
    stakedAmount: any
    stakeToken: {
      __typename?: 'Token'
      id: string
      symbol: string
      name: string
      decimals: any
      totalSupply: any
      derivedNativeCurrency: any
    }
    rewards: Array<{
      __typename?: 'SingleSidedStakingCampaignReward'
      amount: any
      token: {
        __typename?: 'Token'
        name: string
        symbol: string
        decimals: any
        derivedNativeCurrency: any
        address: string
      }
    }>
    singleSidedStakingPositions: Array<{ __typename?: 'SingleSidedStakingCampaignPosition'; id: string }>
  }>
}

export type GetTokenQueryVariables = Exact<{
  tokenId: Scalars['ID']
}>

export type GetTokenQuery = {
  __typename?: 'Query'
  token?: { __typename?: 'Token'; derivedNativeCurrency: any } | null
}

export type GetUserLiquidityPositionsQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['String']>
  endsAtLowerLimit: Scalars['BigInt']
}>

export type GetUserLiquidityPositionsQuery = {
  __typename?: 'Query'
  liquidityPositions: Array<{
    __typename?: 'LiquidityPosition'
    pair: {
      __typename?: 'Pair'
      reserveNativeCurrency: any
      reserveUSD: any
      totalSupply: any
      reserve0: any
      reserve1: any
      address: string
      token0: {
        __typename?: 'Token'
        name: string
        symbol: string
        decimals: any
        derivedNativeCurrency: any
        address: string
      }
      token1: {
        __typename?: 'Token'
        name: string
        symbol: string
        decimals: any
        derivedNativeCurrency: any
        address: string
      }
      liquidityMiningCampaigns: Array<{
        __typename?: 'LiquidityMiningCampaign'
        duration: any
        startsAt: any
        endsAt: any
        locked: boolean
        stakingCap: any
        stakedAmount: any
        address: string
        rewards: Array<{
          __typename?: 'LiquidityMiningCampaignReward'
          amount: any
          token: {
            __typename?: 'Token'
            name: string
            symbol: string
            decimals: any
            derivedNativeCurrency: any
            address: string
          }
        }>
        liquidityMiningPositions: Array<{ __typename?: 'LiquidityMiningPosition'; id: string }>
      }>
    }
  }>
  liquidityMiningPositions: Array<{
    __typename?: 'LiquidityMiningPosition'
    pair: {
      __typename?: 'Pair'
      reserveNativeCurrency: any
      reserveUSD: any
      totalSupply: any
      reserve0: any
      reserve1: any
      address: string
      token0: {
        __typename?: 'Token'
        name: string
        symbol: string
        decimals: any
        derivedNativeCurrency: any
        address: string
      }
      token1: {
        __typename?: 'Token'
        name: string
        symbol: string
        decimals: any
        derivedNativeCurrency: any
        address: string
      }
      liquidityMiningCampaigns: Array<{
        __typename?: 'LiquidityMiningCampaign'
        duration: any
        startsAt: any
        endsAt: any
        locked: boolean
        stakingCap: any
        stakedAmount: any
        address: string
        rewards: Array<{
          __typename?: 'LiquidityMiningCampaignReward'
          amount: any
          token: {
            __typename?: 'Token'
            name: string
            symbol: string
            decimals: any
            derivedNativeCurrency: any
            address: string
          }
        }>
        liquidityMiningPositions: Array<{ __typename?: 'LiquidityMiningPosition'; id: string }>
      }>
    }
  }>
}

export type LiquidityMiningCampaignFragmentFragment = {
  __typename?: 'LiquidityMiningCampaign'
  duration: any
  startsAt: any
  endsAt: any
  locked: boolean
  stakingCap: any
  stakedAmount: any
  address: string
}

export type LiquidityMiningCampaignRewardFragmentFragment = {
  __typename?: 'LiquidityMiningCampaignReward'
  amount: any
  token: {
    __typename?: 'Token'
    name: string
    symbol: string
    decimals: any
    derivedNativeCurrency: any
    address: string
  }
}

export type PairFragmentFragment = {
  __typename?: 'Pair'
  reserveNativeCurrency: any
  reserveUSD: any
  totalSupply: any
  reserve0: any
  reserve1: any
}

export type ReservePartFragment = { __typename?: 'Pair'; reserve0: any; reserve1: any }

export type SingleSidedStakingCampaignFragmentFragment = {
  __typename?: 'SingleSidedStakingCampaign'
  id: string
  owner: any
  duration: any
  startsAt: any
  endsAt: any
  locked: boolean
  stakingCap: any
  stakedAmount: any
}

export type SingleSidedStakingCampaignRewardFragmentFragment = {
  __typename?: 'SingleSidedStakingCampaignReward'
  amount: any
  token: {
    __typename?: 'Token'
    name: string
    symbol: string
    decimals: any
    derivedNativeCurrency: any
    address: string
  }
}

export type StakeTokenFragmentFragment = {
  __typename?: 'Token'
  id: string
  symbol: string
  name: string
  decimals: any
  totalSupply: any
  derivedNativeCurrency: any
}

export type TokenFragmentFragment = {
  __typename?: 'Token'
  name: string
  symbol: string
  decimals: any
  derivedNativeCurrency: any
  address: string
}

export const LiquidityMiningCampaignFragmentFragmentDoc = gql`
  fragment LiquidityMiningCampaignFragment on LiquidityMiningCampaign {
    address: id
    duration
    startsAt
    endsAt
    locked
    stakingCap
    stakedAmount
  }
`
export const LiquidityMiningCampaignRewardFragmentFragmentDoc = gql`
  fragment LiquidityMiningCampaignRewardFragment on LiquidityMiningCampaignReward {
    token {
      address: id
      name
      symbol
      decimals
      derivedNativeCurrency
    }
    amount
  }
`
export const ReservePartFragmentDoc = gql`
  fragment ReservePart on Pair {
    reserve0
    reserve1
  }
`
export const PairFragmentFragmentDoc = gql`
  fragment PairFragment on Pair {
    ...ReservePart
    reserveNativeCurrency
    reserveUSD
    totalSupply
  }
  ${ReservePartFragmentDoc}
`
export const SingleSidedStakingCampaignFragmentFragmentDoc = gql`
  fragment SingleSidedStakingCampaignFragment on SingleSidedStakingCampaign {
    id
    owner
    duration
    startsAt
    endsAt
    locked
    stakingCap
    stakedAmount
  }
`
export const SingleSidedStakingCampaignRewardFragmentFragmentDoc = gql`
  fragment SingleSidedStakingCampaignRewardFragment on SingleSidedStakingCampaignReward {
    token {
      address: id
      name
      symbol
      decimals
      derivedNativeCurrency
    }
    amount
  }
`
export const StakeTokenFragmentFragmentDoc = gql`
  fragment StakeTokenFragment on Token {
    id
    symbol
    name
    decimals
    totalSupply
    derivedNativeCurrency
  }
`
export const TokenFragmentFragmentDoc = gql`
  fragment TokenFragment on Token {
    address: id
    name
    symbol
    decimals
    derivedNativeCurrency
  }
`
export const GetBundleDocument = gql`
  query getBundle {
    bundle(id: "1") {
      nativeCurrencyPrice
    }
  }
`

/**
 * __useGetBundleQuery__
 *
 * To run a query within a React component, call `useGetBundleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBundleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBundleQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetBundleQuery(baseOptions?: Apollo.QueryHookOptions<GetBundleQuery, GetBundleQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetBundleQuery, GetBundleQueryVariables>(GetBundleDocument, options)
}
export function useGetBundleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetBundleQuery, GetBundleQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetBundleQuery, GetBundleQueryVariables>(GetBundleDocument, options)
}
export type GetBundleQueryHookResult = ReturnType<typeof useGetBundleQuery>
export type GetBundleLazyQueryHookResult = ReturnType<typeof useGetBundleLazyQuery>
export type GetBundleQueryResult = Apollo.QueryResult<GetBundleQuery, GetBundleQueryVariables>
export const GetDerivedNativeCurrencyTokensDocument = gql`
  query getDerivedNativeCurrencyTokens($tokenIds: [ID!]!) {
    tokens(where: { id_in: $tokenIds }) {
      address: id
      derivedNativeCurrency
    }
  }
`

/**
 * __useGetDerivedNativeCurrencyTokensQuery__
 *
 * To run a query within a React component, call `useGetDerivedNativeCurrencyTokensQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDerivedNativeCurrencyTokensQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDerivedNativeCurrencyTokensQuery({
 *   variables: {
 *      tokenIds: // value for 'tokenIds'
 *   },
 * });
 */
export function useGetDerivedNativeCurrencyTokensQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetDerivedNativeCurrencyTokensQuery,
    GetDerivedNativeCurrencyTokensQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetDerivedNativeCurrencyTokensQuery, GetDerivedNativeCurrencyTokensQueryVariables>(
    GetDerivedNativeCurrencyTokensDocument,
    options
  )
}
export function useGetDerivedNativeCurrencyTokensLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetDerivedNativeCurrencyTokensQuery,
    GetDerivedNativeCurrencyTokensQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetDerivedNativeCurrencyTokensQuery, GetDerivedNativeCurrencyTokensQueryVariables>(
    GetDerivedNativeCurrencyTokensDocument,
    options
  )
}
export type GetDerivedNativeCurrencyTokensQueryHookResult = ReturnType<typeof useGetDerivedNativeCurrencyTokensQuery>
export type GetDerivedNativeCurrencyTokensLazyQueryHookResult = ReturnType<
  typeof useGetDerivedNativeCurrencyTokensLazyQuery
>
export type GetDerivedNativeCurrencyTokensQueryResult = Apollo.QueryResult<
  GetDerivedNativeCurrencyTokensQuery,
  GetDerivedNativeCurrencyTokensQueryVariables
>
export const GetLiquidityMiningCampaignDocument = gql`
  query getLiquidityMiningCampaign($liquidityMiningCampaignId: ID!) {
    liquidityMiningCampaign(id: $liquidityMiningCampaignId) {
      ...LiquidityMiningCampaignFragment
      rewards {
        ...LiquidityMiningCampaignRewardFragment
      }
    }
  }
  ${LiquidityMiningCampaignFragmentFragmentDoc}
  ${LiquidityMiningCampaignRewardFragmentFragmentDoc}
`

/**
 * __useGetLiquidityMiningCampaignQuery__
 *
 * To run a query within a React component, call `useGetLiquidityMiningCampaignQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLiquidityMiningCampaignQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLiquidityMiningCampaignQuery({
 *   variables: {
 *      liquidityMiningCampaignId: // value for 'liquidityMiningCampaignId'
 *   },
 * });
 */
export function useGetLiquidityMiningCampaignQuery(
  baseOptions: Apollo.QueryHookOptions<GetLiquidityMiningCampaignQuery, GetLiquidityMiningCampaignQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetLiquidityMiningCampaignQuery, GetLiquidityMiningCampaignQueryVariables>(
    GetLiquidityMiningCampaignDocument,
    options
  )
}
export function useGetLiquidityMiningCampaignLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetLiquidityMiningCampaignQuery, GetLiquidityMiningCampaignQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetLiquidityMiningCampaignQuery, GetLiquidityMiningCampaignQueryVariables>(
    GetLiquidityMiningCampaignDocument,
    options
  )
}
export type GetLiquidityMiningCampaignQueryHookResult = ReturnType<typeof useGetLiquidityMiningCampaignQuery>
export type GetLiquidityMiningCampaignLazyQueryHookResult = ReturnType<typeof useGetLiquidityMiningCampaignLazyQuery>
export type GetLiquidityMiningCampaignQueryResult = Apollo.QueryResult<
  GetLiquidityMiningCampaignQuery,
  GetLiquidityMiningCampaignQueryVariables
>
export const GetLiquidityMiningCampaignsDocument = gql`
  query getLiquidityMiningCampaigns($userId: String) {
    liquidityMiningCampaigns(first: 999) {
      ...LiquidityMiningCampaignFragment
      rewards {
        ...LiquidityMiningCampaignRewardFragment
      }
      stakablePair {
        id
        ...PairFragment
        token0 {
          ...TokenFragment
        }
        token1 {
          ...TokenFragment
        }
      }
      liquidityMiningPositions(where: { stakedAmount_gt: 0, user: $userId }) {
        id
      }
    }
  }
  ${LiquidityMiningCampaignFragmentFragmentDoc}
  ${LiquidityMiningCampaignRewardFragmentFragmentDoc}
  ${PairFragmentFragmentDoc}
  ${TokenFragmentFragmentDoc}
`

/**
 * __useGetLiquidityMiningCampaignsQuery__
 *
 * To run a query within a React component, call `useGetLiquidityMiningCampaignsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLiquidityMiningCampaignsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLiquidityMiningCampaignsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetLiquidityMiningCampaignsQuery(
  baseOptions?: Apollo.QueryHookOptions<GetLiquidityMiningCampaignsQuery, GetLiquidityMiningCampaignsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetLiquidityMiningCampaignsQuery, GetLiquidityMiningCampaignsQueryVariables>(
    GetLiquidityMiningCampaignsDocument,
    options
  )
}
export function useGetLiquidityMiningCampaignsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetLiquidityMiningCampaignsQuery, GetLiquidityMiningCampaignsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetLiquidityMiningCampaignsQuery, GetLiquidityMiningCampaignsQueryVariables>(
    GetLiquidityMiningCampaignsDocument,
    options
  )
}
export type GetLiquidityMiningCampaignsQueryHookResult = ReturnType<typeof useGetLiquidityMiningCampaignsQuery>
export type GetLiquidityMiningCampaignsLazyQueryHookResult = ReturnType<typeof useGetLiquidityMiningCampaignsLazyQuery>
export type GetLiquidityMiningCampaignsQueryResult = Apollo.QueryResult<
  GetLiquidityMiningCampaignsQuery,
  GetLiquidityMiningCampaignsQueryVariables
>
export const GetPairDocument = gql`
  query getPair($pairId: ID!) {
    pair(id: $pairId) {
      id
      ...PairFragment
      token0 {
        derivedNativeCurrency
      }
      token1 {
        derivedNativeCurrency
      }
    }
  }
  ${PairFragmentFragmentDoc}
`

/**
 * __useGetPairQuery__
 *
 * To run a query within a React component, call `useGetPairQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPairQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPairQuery({
 *   variables: {
 *      pairId: // value for 'pairId'
 *   },
 * });
 */
export function useGetPairQuery(baseOptions: Apollo.QueryHookOptions<GetPairQuery, GetPairQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetPairQuery, GetPairQueryVariables>(GetPairDocument, options)
}
export function useGetPairLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPairQuery, GetPairQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetPairQuery, GetPairQueryVariables>(GetPairDocument, options)
}
export type GetPairQueryHookResult = ReturnType<typeof useGetPairQuery>
export type GetPairLazyQueryHookResult = ReturnType<typeof useGetPairLazyQuery>
export type GetPairQueryResult = Apollo.QueryResult<GetPairQuery, GetPairQueryVariables>
export const GetPairLiquidityMiningCampaingsDocument = gql`
  query getPairLiquidityMiningCampaings($endsAtLowerLimit: BigInt!, $pairId: ID!) {
    pair(id: $pairId) {
      address: id
      ...PairFragment
      token0 {
        ...TokenFragment
      }
      token1 {
        ...TokenFragment
      }
      liquidityMiningCampaigns(where: { endsAt_gt: $endsAtLowerLimit }) {
        ...LiquidityMiningCampaignFragment
        rewards {
          ...LiquidityMiningCampaignRewardFragment
        }
      }
    }
  }
  ${PairFragmentFragmentDoc}
  ${TokenFragmentFragmentDoc}
  ${LiquidityMiningCampaignFragmentFragmentDoc}
  ${LiquidityMiningCampaignRewardFragmentFragmentDoc}
`

/**
 * __useGetPairLiquidityMiningCampaingsQuery__
 *
 * To run a query within a React component, call `useGetPairLiquidityMiningCampaingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPairLiquidityMiningCampaingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPairLiquidityMiningCampaingsQuery({
 *   variables: {
 *      endsAtLowerLimit: // value for 'endsAtLowerLimit'
 *      pairId: // value for 'pairId'
 *   },
 * });
 */
export function useGetPairLiquidityMiningCampaingsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPairLiquidityMiningCampaingsQuery,
    GetPairLiquidityMiningCampaingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetPairLiquidityMiningCampaingsQuery, GetPairLiquidityMiningCampaingsQueryVariables>(
    GetPairLiquidityMiningCampaingsDocument,
    options
  )
}
export function useGetPairLiquidityMiningCampaingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPairLiquidityMiningCampaingsQuery,
    GetPairLiquidityMiningCampaingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetPairLiquidityMiningCampaingsQuery, GetPairLiquidityMiningCampaingsQueryVariables>(
    GetPairLiquidityMiningCampaingsDocument,
    options
  )
}
export type GetPairLiquidityMiningCampaingsQueryHookResult = ReturnType<typeof useGetPairLiquidityMiningCampaingsQuery>
export type GetPairLiquidityMiningCampaingsLazyQueryHookResult = ReturnType<
  typeof useGetPairLiquidityMiningCampaingsLazyQuery
>
export type GetPairLiquidityMiningCampaingsQueryResult = Apollo.QueryResult<
  GetPairLiquidityMiningCampaingsQuery,
  GetPairLiquidityMiningCampaingsQueryVariables
>
export const GetPairsDocument = gql`
  query getPairs {
    pairs(first: 1000) {
      ...ReservePart
      token0 {
        ...TokenFragment
      }
      token1 {
        ...TokenFragment
      }
    }
  }
  ${ReservePartFragmentDoc}
  ${TokenFragmentFragmentDoc}
`

/**
 * __useGetPairsQuery__
 *
 * To run a query within a React component, call `useGetPairsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPairsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPairsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetPairsQuery(baseOptions?: Apollo.QueryHookOptions<GetPairsQuery, GetPairsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetPairsQuery, GetPairsQueryVariables>(GetPairsDocument, options)
}
export function useGetPairsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPairsQuery, GetPairsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetPairsQuery, GetPairsQueryVariables>(GetPairsDocument, options)
}
export type GetPairsQueryHookResult = ReturnType<typeof useGetPairsQuery>
export type GetPairsLazyQueryHookResult = ReturnType<typeof useGetPairsLazyQuery>
export type GetPairsQueryResult = Apollo.QueryResult<GetPairsQuery, GetPairsQueryVariables>
export const GetSingleSidedStakingCampaignDocument = gql`
  query getSingleSidedStakingCampaign($campaignId: ID!) {
    singleSidedStakingCampaign(id: $campaignId) {
      ...SingleSidedStakingCampaignFragment
      stakeToken {
        ...StakeTokenFragment
      }
      rewards {
        ...SingleSidedStakingCampaignRewardFragment
      }
    }
  }
  ${SingleSidedStakingCampaignFragmentFragmentDoc}
  ${StakeTokenFragmentFragmentDoc}
  ${SingleSidedStakingCampaignRewardFragmentFragmentDoc}
`

/**
 * __useGetSingleSidedStakingCampaignQuery__
 *
 * To run a query within a React component, call `useGetSingleSidedStakingCampaignQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSingleSidedStakingCampaignQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSingleSidedStakingCampaignQuery({
 *   variables: {
 *      campaignId: // value for 'campaignId'
 *   },
 * });
 */
export function useGetSingleSidedStakingCampaignQuery(
  baseOptions: Apollo.QueryHookOptions<GetSingleSidedStakingCampaignQuery, GetSingleSidedStakingCampaignQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetSingleSidedStakingCampaignQuery, GetSingleSidedStakingCampaignQueryVariables>(
    GetSingleSidedStakingCampaignDocument,
    options
  )
}
export function useGetSingleSidedStakingCampaignLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSingleSidedStakingCampaignQuery,
    GetSingleSidedStakingCampaignQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetSingleSidedStakingCampaignQuery, GetSingleSidedStakingCampaignQueryVariables>(
    GetSingleSidedStakingCampaignDocument,
    options
  )
}
export type GetSingleSidedStakingCampaignQueryHookResult = ReturnType<typeof useGetSingleSidedStakingCampaignQuery>
export type GetSingleSidedStakingCampaignLazyQueryHookResult = ReturnType<
  typeof useGetSingleSidedStakingCampaignLazyQuery
>
export type GetSingleSidedStakingCampaignQueryResult = Apollo.QueryResult<
  GetSingleSidedStakingCampaignQuery,
  GetSingleSidedStakingCampaignQueryVariables
>
export const GetSingleSidedStakingCampaignsDocument = gql`
  query getSingleSidedStakingCampaigns($stakeTokenId: String, $userId: String) {
    singleSidedStakingCampaigns(first: 100, orderBy: endsAt, where: { stakeToken: $stakeTokenId }) {
      ...SingleSidedStakingCampaignFragment
      stakeToken {
        ...StakeTokenFragment
      }
      rewards {
        ...SingleSidedStakingCampaignRewardFragment
      }
      singleSidedStakingPositions(where: { stakedAmount_gt: 0, user: $userId }) {
        id
        stakedAmount
      }
    }
  }
  ${SingleSidedStakingCampaignFragmentFragmentDoc}
  ${StakeTokenFragmentFragmentDoc}
  ${SingleSidedStakingCampaignRewardFragmentFragmentDoc}
`

/**
 * __useGetSingleSidedStakingCampaignsQuery__
 *
 * To run a query within a React component, call `useGetSingleSidedStakingCampaignsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSingleSidedStakingCampaignsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSingleSidedStakingCampaignsQuery({
 *   variables: {
 *      stakeTokenId: // value for 'stakeTokenId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetSingleSidedStakingCampaignsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetSingleSidedStakingCampaignsQuery,
    GetSingleSidedStakingCampaignsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetSingleSidedStakingCampaignsQuery, GetSingleSidedStakingCampaignsQueryVariables>(
    GetSingleSidedStakingCampaignsDocument,
    options
  )
}
export function useGetSingleSidedStakingCampaignsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSingleSidedStakingCampaignsQuery,
    GetSingleSidedStakingCampaignsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetSingleSidedStakingCampaignsQuery, GetSingleSidedStakingCampaignsQueryVariables>(
    GetSingleSidedStakingCampaignsDocument,
    options
  )
}
export type GetSingleSidedStakingCampaignsQueryHookResult = ReturnType<typeof useGetSingleSidedStakingCampaignsQuery>
export type GetSingleSidedStakingCampaignsLazyQueryHookResult = ReturnType<
  typeof useGetSingleSidedStakingCampaignsLazyQuery
>
export type GetSingleSidedStakingCampaignsQueryResult = Apollo.QueryResult<
  GetSingleSidedStakingCampaignsQuery,
  GetSingleSidedStakingCampaignsQueryVariables
>
export const GetStakingCampaignsDocument = gql`
  query getStakingCampaigns($userId: String) {
    singleSidedStakingCampaigns(first: 999) {
      ...SingleSidedStakingCampaignFragment
      stakeToken {
        ...StakeTokenFragment
      }
      rewards {
        ...SingleSidedStakingCampaignRewardFragment
      }
      singleSidedStakingPositions(where: { stakedAmount_gt: 0, user: $userId }) {
        id
      }
    }
  }
  ${SingleSidedStakingCampaignFragmentFragmentDoc}
  ${StakeTokenFragmentFragmentDoc}
  ${SingleSidedStakingCampaignRewardFragmentFragmentDoc}
`

/**
 * __useGetStakingCampaignsQuery__
 *
 * To run a query within a React component, call `useGetStakingCampaignsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStakingCampaignsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStakingCampaignsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetStakingCampaignsQuery(
  baseOptions?: Apollo.QueryHookOptions<GetStakingCampaignsQuery, GetStakingCampaignsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetStakingCampaignsQuery, GetStakingCampaignsQueryVariables>(
    GetStakingCampaignsDocument,
    options
  )
}
export function useGetStakingCampaignsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetStakingCampaignsQuery, GetStakingCampaignsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetStakingCampaignsQuery, GetStakingCampaignsQueryVariables>(
    GetStakingCampaignsDocument,
    options
  )
}
export type GetStakingCampaignsQueryHookResult = ReturnType<typeof useGetStakingCampaignsQuery>
export type GetStakingCampaignsLazyQueryHookResult = ReturnType<typeof useGetStakingCampaignsLazyQuery>
export type GetStakingCampaignsQueryResult = Apollo.QueryResult<
  GetStakingCampaignsQuery,
  GetStakingCampaignsQueryVariables
>
export const GetTokenDocument = gql`
  query getToken($tokenId: ID!) {
    token(id: $tokenId) {
      derivedNativeCurrency
    }
  }
`

/**
 * __useGetTokenQuery__
 *
 * To run a query within a React component, call `useGetTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTokenQuery({
 *   variables: {
 *      tokenId: // value for 'tokenId'
 *   },
 * });
 */
export function useGetTokenQuery(baseOptions: Apollo.QueryHookOptions<GetTokenQuery, GetTokenQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetTokenQuery, GetTokenQueryVariables>(GetTokenDocument, options)
}
export function useGetTokenLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTokenQuery, GetTokenQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetTokenQuery, GetTokenQueryVariables>(GetTokenDocument, options)
}
export type GetTokenQueryHookResult = ReturnType<typeof useGetTokenQuery>
export type GetTokenLazyQueryHookResult = ReturnType<typeof useGetTokenLazyQuery>
export type GetTokenQueryResult = Apollo.QueryResult<GetTokenQuery, GetTokenQueryVariables>
export const GetUserLiquidityPositionsDocument = gql`
  query getUserLiquidityPositions($userId: String, $endsAtLowerLimit: BigInt!) {
    liquidityPositions(where: { user: $userId, liquidityTokenBalance_gt: 0 }) {
      pair {
        address: id
        ...PairFragment
        token0 {
          ...TokenFragment
        }
        token1 {
          ...TokenFragment
        }
        liquidityMiningCampaigns(where: { endsAt_gt: $endsAtLowerLimit }) {
          ...LiquidityMiningCampaignFragment
          rewards {
            ...LiquidityMiningCampaignRewardFragment
          }
          liquidityMiningPositions(where: { stakedAmount_gt: 0, user: $userId }) {
            id
          }
        }
      }
    }
    liquidityMiningPositions(where: { user: $userId, stakedAmount_gt: 0 }) {
      pair: targetedPair {
        address: id
        ...PairFragment
        token0 {
          ...TokenFragment
        }
        token1 {
          ...TokenFragment
        }
        liquidityMiningCampaigns(where: { endsAt_gt: $endsAtLowerLimit }) {
          ...LiquidityMiningCampaignFragment
          rewards {
            ...LiquidityMiningCampaignRewardFragment
          }
          liquidityMiningPositions(where: { stakedAmount_gt: 0, user: $userId }) {
            id
          }
        }
      }
    }
  }
  ${PairFragmentFragmentDoc}
  ${TokenFragmentFragmentDoc}
  ${LiquidityMiningCampaignFragmentFragmentDoc}
  ${LiquidityMiningCampaignRewardFragmentFragmentDoc}
`

/**
 * __useGetUserLiquidityPositionsQuery__
 *
 * To run a query within a React component, call `useGetUserLiquidityPositionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserLiquidityPositionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserLiquidityPositionsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      endsAtLowerLimit: // value for 'endsAtLowerLimit'
 *   },
 * });
 */
export function useGetUserLiquidityPositionsQuery(
  baseOptions: Apollo.QueryHookOptions<GetUserLiquidityPositionsQuery, GetUserLiquidityPositionsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<GetUserLiquidityPositionsQuery, GetUserLiquidityPositionsQueryVariables>(
    GetUserLiquidityPositionsDocument,
    options
  )
}
export function useGetUserLiquidityPositionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetUserLiquidityPositionsQuery, GetUserLiquidityPositionsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<GetUserLiquidityPositionsQuery, GetUserLiquidityPositionsQueryVariables>(
    GetUserLiquidityPositionsDocument,
    options
  )
}
export type GetUserLiquidityPositionsQueryHookResult = ReturnType<typeof useGetUserLiquidityPositionsQuery>
export type GetUserLiquidityPositionsLazyQueryHookResult = ReturnType<typeof useGetUserLiquidityPositionsLazyQuery>
export type GetUserLiquidityPositionsQueryResult = Apollo.QueryResult<
  GetUserLiquidityPositionsQuery,
  GetUserLiquidityPositionsQueryVariables
>
