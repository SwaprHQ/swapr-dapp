export const InProgress = 'IN_PROGRESS'
export const Passed = 'PASSED'
export const Failed = 'FAILED'

export enum VoteStatus {
  IN_PROGRESS = 'purple3',
  PASSED = 'green2',
  FAILED = 'red1'
}

export type VoteStatusType = typeof InProgress | typeof Passed | typeof Failed
