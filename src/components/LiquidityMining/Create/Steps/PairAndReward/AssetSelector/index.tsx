import { Token } from '@swapr/sdk'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { TYPE } from '../../../../../../theme'
import CurrencyLogo from '../../../../../CurrencyLogo'
import DoubleCurrencyLogo from '../../../../../DoubleLogo'
import { Flex } from 'rebass'
import { SmoothGradientCard } from '../../../../styleds'
import { unwrappedToken } from '../../../../../../utils/wrappedCurrency'
import { CampaignType } from '../../../../../../pages/LiquidityMining/Create'
import { ReactComponent as Cross } from '../../../../../../assets/svg/plusIcon.svg'
import { Diamond } from '../../SingleOrPairCampaign'
//import { ReactComponent as TokenSelect } from '../../../../../../assets/svg//token-select.svg'

const InsideCirlce = styled.div<{ size: string }>`
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  margin: 0 auto;
  /* BG/Dark/#3 */
  text-align: center;

  border: 0.882051px dashed #3e4259;
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
    return <DoubleCurrencyLogo size={84} currency0={currency0} currency1={currency1} />
  } else if (currency0) {
    return <CurrencyLogo style={{ top: '-27px', left: '31px' }} size="98px" currency={currency0} />
  } else {
    return CrossIcon(campaingType)
  }
}

interface AssetSelectorProps {
  currency0?: Token | null
  currency1?: Token | null
  campaingType: CampaignType
  onClick: (event: React.MouseEvent<HTMLElement>) => void
}

export default function AssetSelector({ currency0, currency1, campaingType, onClick }: AssetSelectorProps) {
  const [assetTitle, setAssetTitle] = useState<string | null>(null)

  useEffect(() => {
    if (currency0 && currency1) {
      setAssetTitle(`${unwrappedToken(currency0)?.symbol}/${unwrappedToken(currency1)?.symbol}`)
    } else if (currency0) {
      setAssetTitle(unwrappedToken(currency0)?.symbol || null)
    } else {
      setAssetTitle(`SELECT ${campaingType === CampaignType.TOKEN ? 'TOKEN' : 'PAIR'}`)
    }
  }, [currency0, currency1, campaingType])

  return (
    <SmoothGradientCard
      active={currency0 !== undefined}
      paddingBottom={'34px !important'}
      width={'162px'}
      height={'150px'}
      onClick={onClick}
    >
      <Flex width="100%" justifyContent="center" alignSelf="end" flexDirection={'column'}>
        <AssetLogo campaingType={campaingType} currency0={currency0} currency1={currency1} />

        <TYPE.largeHeader alignSelf={'end'} lineHeight="22px" color="text5" fontSize={13}>
          {assetTitle}
        </TYPE.largeHeader>
      </Flex>
    </SmoothGradientCard>
  )
}
