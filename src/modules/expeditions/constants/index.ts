import { ClaimWeeklyFragmentsResponseDTOTypeEnum } from '../api/generated'

const apiBaseURLDev = 'http://localhost:4000'
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

export const signatureMessageByType: Record<ClaimWeeklyFragmentsResponseDTOTypeEnum, string> = {
  [ClaimWeeklyFragmentsResponseDTOTypeEnum.Provision]: CLAIM_WEEKLY_LIQUIDITY_PROVISION_FRAGMENTS_MESSAGE,
  [ClaimWeeklyFragmentsResponseDTOTypeEnum.Staking]: CLAIM_WEEKLY_LIQUIDITY_STAKING_FRAGMENTS_MESSAGE,
}
