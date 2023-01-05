import { ReactComponent as SwapIcon } from '../../../../assets/images/swap-icon.svg'
import { ArrowWrapper, SwitchIconContainer, SwitchTokensAmountsContainer } from '../../Components/styles'

export default function SwapTokens({ swapTokens, loading }: { swapTokens: any; loading: boolean }) {
  return (
    <SwitchIconContainer
      onClick={() => {
        swapTokens()
      }}
    >
      <SwitchTokensAmountsContainer>
        <ArrowWrapper clickable={!loading} data-testid="switch-tokens-button" className={loading ? 'rotate' : ''}>
          <SwapIcon />
        </ArrowWrapper>
      </SwitchTokensAmountsContainer>
    </SwitchIconContainer>
  )
}
