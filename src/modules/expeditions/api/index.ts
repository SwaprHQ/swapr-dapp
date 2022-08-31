import { EXPEDITIONS_API_BASE_URL, WeeklyFragmentType } from '../constants'

export interface WeeklyFragmentRewards {
  claimableFragments: number
  claimedFragments: number
  totalAmountUSD: number
  liquidityDeposits: any[]
}

export interface GetWeeklyFragmentRewardsResponse {
  data: {
    liquidityProvision: WeeklyFragmentRewards
    liquidityStaking: WeeklyFragmentRewards
  }
}

/**
 * Get weekly fragment rewards for given user
 * @param address user address
 * @returns
 */
export function getUserExpeditionsRewards(address: string): Promise<GetWeeklyFragmentRewardsResponse> {
  const params = new URLSearchParams({
    address,
  })

  const url = `${EXPEDITIONS_API_BASE_URL}/expeditions/weekly-fragments?${params.toString()}`

  return fetch(url).then(res => res.json())
}

export interface ClaimUserWeeklyFragmentsParams {
  address: string
  type: WeeklyFragmentType
  signature: string
}

/**
 *
 * @param address user address
 * @param signature EIP712 signature
 * @returns
 */
export function claimUserWeeklyFragments(payload: ClaimUserWeeklyFragmentsParams): Promise<any> {
  const url = new URL('/expeditions/weekly-fragments/claim', EXPEDITIONS_API_BASE_URL)

  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => res.json())
}
