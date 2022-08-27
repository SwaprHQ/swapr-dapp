const apiBaseURLDev = 'http://localhost:4000' // development: see
const apiBaseURLProd = 'https://api.swapr.site/v1.0'

/**
 * Expeditions API base URL
 */
export const EXPEDITIONS_API_BASE_URL = process.env.NODE_ENV === 'production' ? apiBaseURLProd : apiBaseURLDev

/**
 * Messages to be signed by client for claiming fragments.
 */
export const CLAIM_DAILY_VISIT_FRAGMENTS_MESSAGE = 'Claim Swapr daily visit fragments'
export const CLAIM_WEEKLY_LIQUIDITY_PROVISION_FRAGMENTS_MESSAGE = 'Claim Swapr weekly liquidity provision fragments'
export const CLAIM_WEEKLY_LIQUIDITY_STAKING_FRAGMENTS_MESSAGE = 'Claim Swapr weekly liquidity staking fragments'

export enum WeeklyFragmentType {
  LIQUIDITY_PROVISION = 'LIQUIDITY_PROVISION',
  LIQUIDITY_STAKING = 'LIQUIDITY_STAKING',
}

export const signatureMessageByType: Record<WeeklyFragmentType, string> = {
  [WeeklyFragmentType.LIQUIDITY_PROVISION]: CLAIM_WEEKLY_LIQUIDITY_PROVISION_FRAGMENTS_MESSAGE,
  [WeeklyFragmentType.LIQUIDITY_STAKING]: CLAIM_WEEKLY_LIQUIDITY_STAKING_FRAGMENTS_MESSAGE,
}
