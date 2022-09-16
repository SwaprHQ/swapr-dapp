import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { ReactComponent as EcoRouter } from '../../assets/images/eco-router.svg'
import { TESTNETS } from '../../constants'
import { useActiveWeb3React, useUnsupportedChainIdError } from '../../hooks'
import { useIsDesktopByMedia } from '../../hooks/useIsDesktopByMedia'
import { ecoBridgeUIActions } from '../../services/EcoBridge/store/UI.reducer'
import { SwapTabs } from '../../state/user/reducer'
import Row from '../Row'

const TabsColumn = styled.div`
  max-width: 457px;
  width: 100%;
`

const TabsRow = styled(Row)`
  display: inline-flex;
  width: auto;
  margin: 0 0 10px;
  padding: 2px;
  background: ${({ theme }) => theme.bg6};
  border-radius: 12px;
`

const Button = styled.button`
  display: flex;
  align-items: center;
  padding: 7px 10px;
  font-weight: 600;
  font-size: 11px;
  line-height: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text5};
  border-radius: 10px;
  border: none;
  background: none;
  cursor: pointer;

  &.active {
    color: #ffffff;
    background: ${({ theme }) => theme.bg2};
    font-size: 12px;
    line-height: 14px;
  }

  &:disabled {
    color: ${({ theme }) => theme.text6};
    cursor: not-allowed;
  }
`

const StyledEcoRouter = styled(EcoRouter)`
  margin-right: 5px;
`

export const Tabs = ({ activeTab, setActiveTab }: { activeTab: SwapTabs; setActiveTab: (tab: SwapTabs) => void }) => {
  const { t } = useTranslation('swap')
  const isDesktop = useIsDesktopByMedia()
  const { chainId } = useActiveWeb3React()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isUnsupportedChainIdError = useUnsupportedChainIdError()

  return (
    <TabsColumn>
      <TabsRow>
        <Button
          onClick={() => setActiveTab(SwapTabs.SWAP)}
          className={
            activeTab === SwapTabs.SWAP || !isUnsupportedChainIdError || (chainId && TESTNETS.includes(chainId))
              ? 'active'
              : ''
          }
          title="Swap with Eco Router V1.5"
        >
          <StyledEcoRouter />
          Swap
        </Button>
        <Button
          disabled={isUnsupportedChainIdError || (chainId && TESTNETS.includes(chainId)) || !isDesktop}
          onClick={() => setActiveTab(SwapTabs.ADVANCED_SWAP_MODE)}
          className={
            activeTab === SwapTabs.ADVANCED_SWAP_MODE &&
            !isUnsupportedChainIdError &&
            chainId &&
            !TESTNETS.includes(chainId)
              ? 'active'
              : ''
          }
          title="Advanced Trade View"
        >
          Adv. Trade
        </Button>
        <Button disabled={true} title="Limit order">
          {t('tabs.limit')}
        </Button>
        <Button
          title="Bridge Swap"
          onClick={() => {
            dispatch(ecoBridgeUIActions.setBridgeSwapStatus(true))
            navigate('/bridge')
          }}
        >
          {t('tabs.bridgeSwap')}
        </Button>
      </TabsRow>
    </TabsColumn>
  )
}
