import { ArrowLeft } from 'react-feather'
import styled from 'styled-components'

import { useRouter } from '../../../hooks/useRouter'
import { RowBetween } from '../../Row'
import { Settings } from '../../Settings'

export function PoolLiquidityHeader({ adding, creating }: { adding: boolean; creating: boolean }) {
  const { navigate } = useRouter()
  return (
    <Tabs>
      <RowBetween mb="16px">
        <StyledArrowLeft onClick={() => navigate(-1)} />
        <ActiveText>{creating ? 'Create a pair' : adding ? 'Add Liquidity' : 'Remove Liquidity'}</ActiveText>
        <Settings simple={true} />
      </RowBetween>
    </Tabs>
  )
}

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 3rem;
  justify-content: space-evenly;
`

const ActiveText = styled.div`
  font-weight: 500;
  font-size: 18px;
  line-height: 22px;
  color: ${({ theme }) => theme.purple3};
`

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.purple3};
  cursor: pointer;
`
