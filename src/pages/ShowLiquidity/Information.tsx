import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { Info } from 'react-feather'
import { Flex } from 'rebass'
import { TYPE } from '../../theme'
import { AutoColumn } from '../../components/Column'
import { LightCard } from '../../components/Card'
import { GradientButton } from './styleds'

export default function Information() {
  const theme = useContext(ThemeContext)
  return (
    <AutoColumn gap="26px">
      <GradientButton style={{ width: '100%', padding: '12px' }}>
        <TYPE.main color={theme.text4} fontWeight={'bold'} fontSize={'12px'} lineHeight={'15px'}>
          ACCOUNT ANALYTICS AND ACCRUED FEES
        </TYPE.main>
        <span style={{ lineHeight: '11px', marginLeft: '8px' }}>↗</span>
      </GradientButton>
      <TYPE.main color={theme.text5} fontWeight={'500'} fontSize={'14px'} lineHeight={'17px'} textAlign="center">
        {"Don't see a pool you joined? "}
        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Import it.</span>
      </TYPE.main>
      <LightCard>
        <AutoColumn gap="md">
          <Flex>
            <Info color={theme.text4} size={18} />
            <TYPE.body color={theme.text4} marginLeft="8px" fontWeight={500} lineHeight="20px" fontSize="16px">
              Liquidity provider rewards
            </TYPE.body>
          </Flex>
          <TYPE.body color={theme.text5} fontWeight="500" fontSize="11px" lineHeight="16px" letterSpacing="-0.4px">
            Liquidity providers earn a swap fee (0.15% by default) on all trades proportional to their share of the
            pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity. The
            swap fee value is decided by DXdao and liquidty providers, it can be between 0% and 10% and it uses 0.15% as
            default value that is assigned when the pair is created.
          </TYPE.body>
          <TYPE.body as="a" color={theme.text4} fontSize="17px" lineHeight="17px">
            Read more about providing liquidity
          </TYPE.body>
        </AutoColumn>
      </LightCard>
    </AutoColumn>
  )
}
