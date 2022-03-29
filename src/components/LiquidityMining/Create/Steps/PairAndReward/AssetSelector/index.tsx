import { Token, TokenAmount } from '@swapr/sdk'
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { CloseIcon, TYPE } from '../../../../../../theme'
import CurrencyLogo from '../../../../../CurrencyLogo'
import DoubleCurrencyLogo from '../../../../../DoubleLogo'
import { Box, Flex } from 'rebass'
import { SmoothGradientCard } from '../../../../styleds'
import { unwrappedToken } from '../../../../../../utils/wrappedCurrency'
import { CampaignType } from '../../../../../../pages/LiquidityMining/Create'
import { ReactComponent as Cross } from '../../../../../../assets/svg/plusIcon.svg'
import { Diamond } from '../../SingleOrPairCampaign'
import NumericalInput from '../../../../../Input/NumericalInput'
import { ButtonPrimary } from '../../../../../Button'
import { useActiveWeb3React } from '../../../../../../hooks'
import { useTokenBalance } from '../../../../../../state/wallet/hooks'
import { useStakingRewardsDistributionFactoryContract } from '../../../../../../hooks/useContract'
import { ApprovalState, useApproveCallback } from '../../../../../../hooks/useApproveCallback'

//import { ReactComponent as TokenSelect } from '../../../../../../assets/svg//token-select.svg'

const InsideCirlce = styled.div<{ size: string }>`
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  margin: 0 auto;
  /* BG/Dark/#3 */
  text-align: center;

  /* border: 1.10256px dashed #3e4259; */
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='100' ry='100' stroke='%233E4259FF' stroke-width='1' stroke-dasharray='6%25%2c 8%25' stroke-dashoffset='0' stroke-linecap='butt'/%3e%3c/svg%3e");
  box-sizing: border-box;
  backdrop-filter: blur(12.3487px);
  /* Note: backdrop-filter has minimal browser support */

  border-radius: 219.679px;
`
const StyledSvg = styled.div`
  display: flex;
  align-items: center;

  height: 100%;
  svg {
    margin: 0 auto;
    display: block;
  }
`
const DoubleIconWrapper = styled.div`
  position: absolute;
  top: -24px;
  left: 59px;
`
const StyledCurrencyLogo = styled(CurrencyLogo)`
  position: absolute;
  top: -31px;
`
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
interface AssetLogoProps {
  currency0?: Token | null
  currency1?: Token | null
  campaingType: CampaignType
}

const CrossIcon = (campaingType: CampaignType) => {
  if (campaingType === CampaignType.TOKEN) {
    return (
      <Diamond size={'100'} style={{ top: '-27px', left: '31px' }} active={false}>
        <InsideCirlce size={'80'}>
          <StyledSvg>
            <Cross></Cross>
          </StyledSvg>
        </InsideCirlce>
      </Diamond>
      // <TokenSelect />
    )
  } else {
    return (
      <DoubleIconWrapper>
        <Diamond size={'84'} active={false} style={{ left: '-38px' }}>
          <InsideCirlce size={'65'}>
            <StyledSvg>
              <Cross></Cross>
            </StyledSvg>
          </InsideCirlce>
        </Diamond>
        <Diamond size={'84'} active={false} style={{ left: '0px' }}>
          <InsideCirlce size={'65'}>
            <StyledSvg>
              <Cross></Cross>
            </StyledSvg>
          </InsideCirlce>
        </Diamond>
      </DoubleIconWrapper>
    )
  }
}

const AssetLogo = ({ currency0, currency1, campaingType }: AssetLogoProps) => {
  if (currency0 && currency1) {
    return (
      <DoubleCurrencyLogo
        style={{ position: 'absolute', top: '-26px' }}
        size={84}
        currency0={currency0}
        currency1={currency1}
      />
    )
  } else if (currency0) {
    return <StyledCurrencyLogo size="98px" currency={currency0} />
  } else {
    return CrossIcon(campaingType)
  }
}
const RelativeContainer = styled.div<{ disabled?: boolean }>`
  position: relative;
  transition: opacity 0.3s ease;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
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
  amount?: string
  handleUserInput?: (value: string) => void
  onResetCurrency?: () => void
  onClick: (event: React.MouseEvent<HTMLElement>) => void
}

export default function AssetSelector({
  customAssetTitle,
  currency0,
  currency1,
  campaingType,
  onClick,
  amount,
  onResetCurrency,
  handleUserInput
}: AssetSelectorProps) {
  const [assetTitle, setAssetTitle] = useState<string | null>(null)
  const [tokenName, setTokenName] = useState<string | undefined>(undefined)

  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false)
  const rewardMemo = useMemo(() => (currency0 && amount ? new TokenAmount(currency0, amount) : undefined), [
    amount,
    currency0
  ])
  const { account } = useActiveWeb3React()
  const userBalance = useTokenBalance(account || undefined, currency0 !== null ? currency0 : undefined)
  const stakingRewardsDistributionFactoryContract = useStakingRewardsDistributionFactoryContract()
  const [approvalState, approveCallback] = useApproveCallback(
    rewardMemo,
    stakingRewardsDistributionFactoryContract?.address
  )

  const getApproveButtonMessage = () => {
    if (!account) {
      return 'Connect your wallet'
    }
    if (userBalance && rewardMemo && rewardMemo.greaterThan('0') && userBalance.lessThan(rewardMemo)) {
      return 'Insufficient balance'
    }
    if (approvalState === ApprovalState.APPROVED) return 'Approved'
    return 'APPROVE'
  }

  useEffect(() => {
    setAreButtonsDisabled(!!(!account || !rewardMemo || (userBalance && userBalance.lessThan(rewardMemo))))
  }, [account, rewardMemo, userBalance])
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
                <StyledNumericalInput value={amount ? amount : ''} onUserInput={handleUserInput} />
                <RewardInputLogo>{assetTitle}</RewardInputLogo>
              </RelativeContainer>
            ) : (
              <TYPE.largeHeader lineHeight="22px" color="text5" fontSize={13}>
                {customAssetTitle && !tokenName ? customAssetTitle : assetTitle}
              </TYPE.largeHeader>
            )}

            {tokenName && (
              <TYPE.small color="text1" fontSize={11}>
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
            maxWidth={'162px'}
            disabled={areButtonsDisabled || approvalState !== ApprovalState.NOT_APPROVED}
            onClick={approveCallback}
          >
            {getApproveButtonMessage()}
          </ButtonPrimary>
        </Box>
      )}
    </Flex>
  )
}
