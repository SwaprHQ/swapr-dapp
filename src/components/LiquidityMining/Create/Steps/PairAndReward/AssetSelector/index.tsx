import { Token } from '@swapr/sdk'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { TYPE } from '../../../../../../theme'
import CurrencyLogo from '../../../../../CurrencyLogo'
import DoubleCurrencyLogo from '../../../../../DoubleLogo'
import { Box, Flex } from 'rebass'
import { GradientCard } from '../../../../../Card'
import { unwrappedToken } from '../../../../../../utils/wrappedCurrency'
import { CampaignType } from '../../../../../../pages/LiquidityMining/Create'
import { ReactComponent as Cross } from '../../../../../../assets/svg/plusIcon.svg'
import { Diamond } from '../../SingleOrPairCampaign'

const Card = styled(GradientCard)`
  width: 100%;
  padding: 13px 20px;
  border: solid 1px ${props => props.theme.bg3};
`
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
interface AssetLogoProps {
  currency0?: Token | null
  currency1?: Token | null
  campaingType: CampaignType
}

const CrossIcon = (campaingType: CampaignType) => {
  if (campaingType === CampaignType.TOKEN) {
    return (
      <Diamond size={'100'} active={false}>
        <InsideCirlce size={'80'}>
          <StyledSvg>
            <Cross></Cross>
          </StyledSvg>
        </InsideCirlce>
      </Diamond>
    )
  } else {
    return (
      <>
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
      </>
    )
  }
}

const AssetLogo = ({ currency0, currency1, campaingType }: AssetLogoProps) => {
  if (currency0 && currency1) {
    return <DoubleCurrencyLogo size={84} currency0={currency0} currency1={currency1} />
  } else if (currency0) {
    return <CurrencyLogo size="98px" currency={currency0} />
  } else {
    return CrossIcon(campaingType)
  }
}

interface AssetSelectorProps {
  title: string
  currency0?: Token | null
  currency1?: Token | null
  campaingType: CampaignType
  onClick: (event: React.MouseEvent<HTMLElement>) => void
}

export default function AssetSelector({ title, currency0, currency1, campaingType, onClick }: AssetSelectorProps) {
  const [assetTitle, setAssetTitle] = useState<string | null>(null)

  useEffect(() => {
    if (currency0 && currency1) {
      setAssetTitle(`${unwrappedToken(currency0)?.symbol}/${unwrappedToken(currency1)?.symbol}`)
    } else if (currency0) {
      setAssetTitle(unwrappedToken(currency0)?.symbol || null)
    } else {
      setAssetTitle(null)
    }
  }, [currency0, currency1, campaingType])

  return (
    <Flex flexDirection="column">
      <Box mb="16px">
        <TYPE.small fontWeight="600" color="text4" letterSpacing="0.08em">
          {title}
        </TYPE.small>
      </Box>
      <Box>
        <Card selectable onClick={onClick}>
          <Flex height="26px" width="100%" justifyContent="center" alignItems="center">
            <Box mr={currency0 ? '8px' : '0'}>
              <AssetLogo campaingType={campaingType} currency0={currency0} currency1={currency1} />
            </Box>
            <Box>
              <TYPE.body lineHeight="20px" color="white">
                {assetTitle}
              </TYPE.body>
            </Box>
          </Flex>
        </Card>
      </Box>
    </Flex>
  )
}
