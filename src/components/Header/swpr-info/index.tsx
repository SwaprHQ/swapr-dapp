import { TokenAmount } from '@swapr/sdk'

import Skeleton from 'react-loading-skeleton'
import styled from 'styled-components'

import { useActiveWeb3React } from '../../../hooks'
import { HeaderButton } from '../HeaderButton'
import { Amount } from '../styled'

const StakeIndicator = styled(HeaderButton)`
  border-radius: 0px 8px 8px 0px;
`
const Wrapper = styled.div<{ hide: boolean }>`
  display: flex;
  margin-right: 7px;
  border-radius: 15px 50px 30px 5px;
  visibility: ${({ hide }) => (hide ? 'hidden' : 'visible')};
`

interface SwprInfoProps {
  newSwprBalance?: TokenAmount
  onToggleClaimPopup: () => void
  hasActiveCampaigns: boolean
}

export function SwprInfo({ onToggleClaimPopup, newSwprBalance, hasActiveCampaigns }: SwprInfoProps) {
  const { account } = useActiveWeb3React()

  return (
    <Wrapper onClick={onToggleClaimPopup} hide={!account}>
      <Amount borderRadius={hasActiveCampaigns ? '8px 0px 0px 8px !important;' : ''} zero={false}>
        {!account ? (
          '0.000'
        ) : !newSwprBalance ? (
          <Skeleton width="37px" style={{ marginRight: '3px' }} />
        ) : (
          newSwprBalance.toFixed(3)
        )}{' '}
        SWPR
      </Amount>
      {hasActiveCampaigns && <StakeIndicator>STAKE</StakeIndicator>}
    </Wrapper>
  )
}
