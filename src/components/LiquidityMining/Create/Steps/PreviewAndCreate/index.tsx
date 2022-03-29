import React, { useEffect, useState } from 'react'
import { Box, Flex } from 'rebass'
import { Pair, Percent, Token, TokenAmount } from '@swapr/sdk'
import PoolSummary from './PoolSummary'
import RewardSummary from './RewardSummary'
import { Card, Divider } from '../../../styleds'
import { ButtonPrimary } from '../../../../Button'

import styled from 'styled-components'
import { useActiveWeb3React } from '../../../../../hooks'

const FlexContainer = styled(Flex)`
  ${props => props.theme.mediaWidth.upToExtraSmall`
    flex-direction: column;
  `}
`

const ResponsiveContainer = styled(Box)<{ flex1?: boolean }>`
  flex: ${props => (props.flex1 ? 1 : 'auto')};
  ${props => props.theme.mediaWidth.upToExtraSmall`
    margin-top: 16px !important;
  `}
`

interface PreviewProps {
  liquidityPair: Pair | Token | null
  apy: Percent
  startTime: Date | null
  endTime: Date | null
  timelocked: boolean
  stakingCap: TokenAmount | null
  approvals: boolean
  reward: TokenAmount[]
  onCreate: () => void
}

export default function PreviewAndCreate({
  liquidityPair,
  startTime,
  endTime,
  timelocked,
  stakingCap,
  reward,
  apy,
  approvals,
  onCreate
}: PreviewProps) {
  const { account } = useActiveWeb3React()
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false)
  useEffect(() => {
    setAreButtonsDisabled(!!(!account || !reward || !liquidityPair || !startTime || !endTime || !approvals))
  }, [account, reward, liquidityPair, startTime, endTime, approvals])
  const getConfirmButtonMessage = () => {
    if (!account) {
      return 'Connect your wallet'
    }
    // if (userBalance && reward && reward.greaterThan('0') && userBalance.lessThan(reward)) {
    //   return 'Insuffucient balance'
    // }
    return 'Deposit & create'
  }

  return (
    <Flex flexDirection="column" style={{ zIndex: -1 }}>
      <Box mb="40px">
        <Card>
          <FlexContainer justifyContent="stretch" width="100%">
            <PoolSummary
              liquidityPair={liquidityPair}
              startTime={startTime}
              endTime={endTime}
              timelocked={timelocked}
            />
            <Box mx="18px">
              <Divider />
            </Box>
            <ResponsiveContainer flex1>
              <RewardSummary stakingCap={stakingCap} reward={reward} apy={apy} />
            </ResponsiveContainer>
          </FlexContainer>
        </Card>
      </Box>
      <Box>
        <Card>
          <FlexContainer justifyContent="stretch" width="100%">
            {/* <Box width="100%">
              <ButtonPrimary
                disabled={areButtonsDisabled || approvalState !== ApprovalState.NOT_APPROVED}
                onClick={approveCallback}
              >
                {getApproveButtonMessage()}
              </ButtonPrimary>
            </Box> */}
            {/* <Box mx="18px">
              <Divider />
            </Box> */}
            <ResponsiveContainer width="100%">
              <ButtonPrimary disabled={areButtonsDisabled} onClick={onCreate}>
                {getConfirmButtonMessage()}
              </ButtonPrimary>
            </ResponsiveContainer>
          </FlexContainer>
        </Card>
      </Box>
    </Flex>
  )
}
