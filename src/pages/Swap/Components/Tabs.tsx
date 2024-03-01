import { useContext } from 'react'
import { Sliders } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ReactComponent as EcoRouter } from '../../../assets/images/eco-router.svg'
import Row from '../../../components/Row'
import { MouseoverTooltip } from '../../../components/Tooltip'
import { useActiveWeb3React } from '../../../hooks'
import { SwapTab } from '../../../state/user/reducer'
import { supportedChainIdList } from '../LimitOrderBox/constants'
import { SwapTabContext } from '../SwapContext'

const TabsColumn = styled.div`
  max-width: 457px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0 0 10px;
`

const TabsRow = styled(Row)`
  display: inline-flex;
  width: auto;
  padding: 2px 6px;
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
const StyledSliders = styled(Sliders)`
  margin-right: 5px;
  width: 14px;
`

export function Tabs() {
  const { activeTab, setActiveTab } = useContext(SwapTabContext)

  return (
    <TabsColumn>
      <TabsRow>
        <Button
          onClick={() => {
            setActiveTab(SwapTab.SWAP)
          }}
          className={activeTab === SwapTab.SWAP ? 'active' : ''}
        >
          <StyledEcoRouter />
          Swap
        </Button>
        <LimitOrderTab className={activeTab === SwapTab.LIMIT_ORDER ? 'active' : ''} setActiveTab={setActiveTab} />
      </TabsRow>
    </TabsColumn>
  )
}

const LimitOrderTab = ({ className, setActiveTab }: { className?: string; setActiveTab: any }) => {
  const { chainId, account } = useActiveWeb3React()
  const { t } = useTranslation('swap')
  const noLimitOrderSupport = chainId ? !supportedChainIdList.includes(chainId) : true

  const LimitOrderButton = ({ disabled = false }) => (
    <Button onClick={() => setActiveTab(SwapTab.LIMIT_ORDER)} className={className} disabled={disabled}>
      <StyledSliders height={11} />
      {t('tabs.limit')}
    </Button>
  )

  if (account == null || noLimitOrderSupport) {
    return (
      <MouseoverTooltip
        content={noLimitOrderSupport ? 'Available only in Mainnet and Gnosis Chain' : 'Connect your wallet'}
        placement="top"
      >
        <LimitOrderButton disabled={true} />
      </MouseoverTooltip>
    )
  }

  return <LimitOrderButton />
}
