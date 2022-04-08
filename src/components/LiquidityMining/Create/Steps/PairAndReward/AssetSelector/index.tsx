import { Token, TokenAmount } from '@swapr/sdk'
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { CloseIcon, TYPE } from '../../../../../../theme'

import { Box, Flex } from 'rebass'
import { SmoothGradientCard } from '../../../../styleds'
import { unwrappedToken } from '../../../../../../utils/wrappedCurrency'
import { Actions, ActionType, CampaignType } from '../../../../../../pages/LiquidityMining/Create'

import NumericalInput from '../../../../../Input/NumericalInput'
import { ButtonPrimary } from '../../../../../Button'
import { useActiveWeb3React } from '../../../../../../hooks'
import { useTokenBalance } from '../../../../../../state/wallet/hooks'
import { useStakingRewardsDistributionFactoryContract } from '../../../../../../hooks/useContract'
import { ApprovalState, useApproveCallback } from '../../../../../../hooks/useApproveCallback'
import { AssetLogo } from './AssetLogo'

const StyledNumericalInput = styled(NumericalInput)`
  border: 8px solid;
  border-radius: 8px;
  border: none;
  width: 100%;
  height: 33px;
  font-weight: 600;
  font-size: 16px;
  line-height: 16px;
  text-transform: uppercase;
  padding-left: 8px;
  padding-right: 8px;
  background-color: ${props => props.theme.dark1};
`
const RewardInputLogo = styled.div`
  position: absolute;
  top: 8px;
  right: 16px;
`

const RelativeContainer = styled.div<{ disabled?: boolean }>`
  position: relative;
  transition: opacity 0.3s ease;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  margin-bottom: 8px;
`
const RelativeDismiss = styled(CloseIcon)`
  position: absolute;
  padding: 0;
  top: -18px;
  right: 7px;

  svg {
    stroke: #464366;
  }
`

interface AssetSelectorProps {
  currency0?: Token | null
  currency1?: Token | null
  campaingType: CampaignType
  customAssetTitle?: string
  amount?: TokenAmount
  index?: number
  handleUserInput?: (value: string) => void
  onResetCurrency?: () => void
  onClick: (event: React.MouseEvent<HTMLElement>) => void
  rawAmount?: string
  setRewardsObject?: React.Dispatch<Actions>
}

export default function AssetSelector({
  customAssetTitle,
  currency0,
  currency1,
  campaingType,
  onClick,
  amount,
  onResetCurrency,
  handleUserInput,
  index,
  rawAmount,
  setRewardsObject
}: AssetSelectorProps) {
  const [assetTitle, setAssetTitle] = useState<string | null>(null)
  const [tokenName, setTokenName] = useState<string | undefined>(undefined)

  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false)

  const rewardMemo = useMemo(() => (currency0 && amount ? amount : undefined), [currency0, amount])
  const { account } = useActiveWeb3React()
  const userBalance = useTokenBalance(account || undefined, currency0 !== null ? currency0 : undefined)
  const stakingRewardsDistributionFactoryContract = useStakingRewardsDistributionFactoryContract()
  const [approvalState, approveCallback] = useApproveCallback(
    rewardMemo,
    stakingRewardsDistributionFactoryContract?.address
  )

  const getApproveButtonMessage = useMemo(() => {
    if (!account) {
      return 'Connect your wallet'
    } else if (userBalance && rewardMemo && rewardMemo.greaterThan('0') && userBalance.lessThan(rewardMemo)) {
      return 'Insufficient balance'
    } else if (approvalState === ApprovalState.APPROVED && rewardMemo && rewardMemo.greaterThan('0')) {
      return 'Approved'
    } else {
      return 'Approve'
    }
  }, [approvalState, account, userBalance, rewardMemo])

  useEffect(() => {
    if (setRewardsObject && rewardMemo && userBalance) {
      setRewardsObject({
        type: ActionType.APPROVALS_CHANGE,
        payload: {
          index: index,
          approval:
            rewardMemo.greaterThan('0') &&
            userBalance.greaterThan(rewardMemo) &&
            approvalState === ApprovalState.APPROVED
              ? ApprovalState.APPROVED
              : (rewardMemo.greaterThan('0') && userBalance?.lessThan(rewardMemo)) ||
                approvalState === ApprovalState.NOT_APPROVED
              ? ApprovalState.NOT_APPROVED
              : ApprovalState.UNKNOWN
        }
      })
    }

    setAreButtonsDisabled(!!(!account || !rewardMemo || (userBalance && userBalance.lessThan(rewardMemo))))
  }, [account, rewardMemo, userBalance, setRewardsObject, index, approvalState])

  useEffect(() => {
    if (currency0 && currency1) {
      setTokenName('LP PAIR')
      setAssetTitle(`${unwrappedToken(currency0)?.symbol}/${unwrappedToken(currency1)?.symbol}`)
    } else if (currency0) {
      setTokenName(unwrappedToken(currency0)?.name)
      setAssetTitle(unwrappedToken(currency0)?.symbol || null)
    } else {
      setTokenName(undefined)
      setAssetTitle(`SELECT ${campaingType === CampaignType.TOKEN ? 'TOKEN' : 'PAIR'}`)
    }
  }, [currency0, currency1, campaingType])
  const handleDismiss = () => {
    setAssetTitle(null)
    if (onResetCurrency) onResetCurrency()
    setTokenName(undefined)
  }

  const isReward = handleUserInput !== undefined && currency0
  return (
    <Flex flexDirection={'column'}>
      <SmoothGradientCard
        active={currency0 !== undefined}
        paddingBottom={'34px !important'}
        width={'162px'}
        height={handleUserInput !== undefined ? '192px' : '150px'}
        onClick={event => {
          if (isReward) event.stopPropagation()
          else onClick(event)
        }}
      >
        {handleUserInput && (
          <RelativeDismiss
            onClick={event => {
              event.stopPropagation()
              if (isReward) handleDismiss()
            }}
          />
        )}

        <Flex width="100%" justifyContent="center" alignSelf="end">
          <AssetLogo campaingType={campaingType} currency0={currency0} currency1={currency1} />
          <Flex flexDirection={'column'}>
            {handleUserInput !== undefined && currency0 ? (
              <RelativeContainer>
                <StyledNumericalInput value={rawAmount ? rawAmount : ''} onUserInput={handleUserInput} />
                <RewardInputLogo>{assetTitle}</RewardInputLogo>
              </RelativeContainer>
            ) : (
              <TYPE.largeHeader marginBottom={'4px'} lineHeight="22px" color="lightPurple" fontSize={13}>
                {customAssetTitle && !tokenName ? customAssetTitle : assetTitle}
              </TYPE.largeHeader>
            )}

            {tokenName && (
              <TYPE.small color="purple3" fontSize={10} fontWeight="600" lineHeight="12px">
                {tokenName}
              </TYPE.small>
            )}
          </Flex>
        </Flex>
      </SmoothGradientCard>
      {handleUserInput && (
        <Box>
          <ButtonPrimary
            height={'32px'}
            marginTop="16px"
            width={'160px'}
            disabled={areButtonsDisabled || approvalState !== ApprovalState.NOT_APPROVED}
            onClick={approveCallback}
          >
            {getApproveButtonMessage}
          </ButtonPrimary>
        </Box>
      )}
    </Flex>
  )
}
