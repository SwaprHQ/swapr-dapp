import React, { useMemo, useState, useEffect } from 'react'
import { Flex, Text } from 'rebass'
import { withRouter } from 'react-router-dom'
import { SWPR } from '@swapr/sdk'
import { ChevronUp } from 'react-feather'

import styled, { css } from 'styled-components'

import { useActiveWeb3React, useUnsupportedChainIdError } from '../../hooks'
import { useDarkModeManager } from '../../state/user/hooks'
import { useNativeCurrencyBalance, useTokenBalance } from '../../state/wallet/hooks'
import { ReactComponent as GasInfoSvg } from '../../assets/svg/gas-info.svg'

import { Settings } from '../Settings'

import Row, { RowFixed, RowFlat } from '../Row'
import Web3Status from '../Web3Status'
import { useTranslation } from 'react-i18next'
import MobileOptions from './MobileOptions'
import { useNativeCurrency } from '../../hooks/useNativeCurrency'
import SwaprVersionLogo from '../SwaprVersionLogo'
import { useModalOpen, useToggleShowClaimPopup } from '../../state/application/hooks'
import ClaimModal from '../claim/ClaimModal'
import Skeleton from 'react-loading-skeleton'
import { SwprInfo } from './swpr-info'
import { useSwaprSinglelSidedStakeCampaigns } from '../../hooks/singleSidedStakeCampaigns/useSwaprSingleSidedStakeCampaigns'
import { useLiquidityMiningCampaignPosition } from '../../hooks/useLiquidityMiningCampaignPosition'
import UnsupportedNetworkPopover from '../NetworkUnsupportedPopover'
import { ApplicationModal } from '../../state/application/actions'
import { useGasInfo } from '../../hooks/useGasInfo'
import { HeaderLink, HeaderMobileLink } from './HeaderLink'
import { HeaderLinkBadge } from './HeaderLinkBadge'

const HeaderFrame = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: 1rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    width: calc(100%);
    position: relative;
  `};
  max-height: 100px;
`

const HeaderControls = styled.div<{ isConnected: boolean }>`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    position: fixed;
    bottom: 0px;
    left: 0px;
    display: flex;
    align-items: center;
    justify-content: 'space-between';
    width: 100%;
    height: 72px;
    padding: 1rem;
    z-index: 99;
    background-color: ${({ theme }) => theme.bg2};
    transition: 0.35s ease-in-out all;
    &.hidden {
      bottom: -72px;
      opacity: 0;
    }
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row-reverse;
    align-items: center;
    justify-content: center;
  `};
`

const MoreLinksIcon = styled(HeaderElement)`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    width:100%;
    justify-content: flex-start;

  `};
`

const HeaderRow = styled(RowFixed)<{ isDark: boolean }>`
  ${({ theme }) => theme.mediaWidth.upToLarge`
    width: 100%;
  `};
`

const HeaderSubRow = styled(RowFlat)`
  align-items: center;
  justify-content: flex-end;
  margin-top: 10px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
     margin-top: 0px;
  `};
`

const HeaderLinks = styled(Row)`
  justify-content: start;
  gap: 40px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  margin-left: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0px;
  `};
  :hover {
    cursor: pointer;
  }
`

export const Amount = styled.p<{ clickable?: boolean; zero: boolean; borderRadius?: string }>`
  padding: 6px 8px;
  margin: 0;
  max-height: 22px;
  display: inline-flex;
  font-weight: bold;
  font-size: 10px;
  line-height: 11px;
  text-align: center;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text4};
  background: ${({ theme }) => theme.bg1};
  border-radius: ${props => (props.borderRadius ? props.borderRadius : '12px')};
  cursor: ${props => (props.clickable ? 'pointer' : 'initial')};
  white-space: nowrap;
  ${props =>
    props.zero &&
    css`
      color: ${props => props.theme.red1};
      background: rgba(240, 46, 81, 0.2);
    `};

  & + & {
    margin-left: 7px;
  }
`
const GasInfo = styled.div<{ hide: boolean }>`
  display: ${({ hide }) => (hide ? 'none' : 'flex')};
  margin-left: 6px;
  padding: 6px 8px;
  border: 1.06481px solid rgba(242, 153, 74, 0.65);
  background: rgba(242, 153, 74, 0.08);
  border-radius: 8px;

  div {
    color: ${({ theme }) => theme.orange1};
  }

  align-items: center;
`
const GasColor = {
  fast: {
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  normal: {
    color: '#F2994A',
    backgroundColor: 'rgba(242, 153, 74, 0.3);',
  },
  slow: {
    color: '#FF4F84',
    backgroundColor: 'rgba(255, 79, 132, 0.3);',
  },
}
const ColoredGas = styled.div<{ color: 'fast' | 'slow' | 'normal' }>`
  display: flex;
  font-size: 10px;
  height: 16.39px;
  font-weight: 600;
  color: ${props => GasColor[props.color].color};
  background-color: ${props => GasColor[props.color].backgroundColor};
  padding: 3px 4px;
  line-height: 11px;

  border-radius: 4.26px;
`
const Divider = styled.div`
  height: 24px;
  width: 1px;
  background-color: ${({ theme }) => theme.purple3};
  margin-left: 40px;
  @media (max-width: 1080px) and (min-width: 960px) {
    width: 0;
    margin-left: 0px;
  }
`

const AdditionalDataWrap = styled.div`
  margin-left: auto;
  gap: 10px;
  display: flex;
  flex-direction: column;
  justify-content: end;
`
const StyledChevron = styled(ChevronUp)<{ isOpen: boolean }>`
  stroke: ${({ theme }) => theme.orange1};
  transform: ${({ isOpen }) => (isOpen ? 'rotate(0deg)' : 'rotate(180deg)')};
`

function Header() {
  const { account, chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const [isGasInfoOpen, setIsGasInfoOpen] = useState(false)
  const nativeCurrency = useNativeCurrency()
  const { gas } = useGasInfo()
  const userNativeCurrencyBalance = useNativeCurrencyBalance()
  const [isDark] = useDarkModeManager()
  const { loading, data } = useSwaprSinglelSidedStakeCampaigns()
  const { stakedTokenAmount } = useLiquidityMiningCampaignPosition(data, account ? account : undefined)

  const toggleClaimPopup = useToggleShowClaimPopup()
  const accountOrUndefined = useMemo(() => account || undefined, [account])
  const newSwpr = useMemo(() => (chainId ? SWPR[chainId] : undefined), [chainId])
  const newSwprBalance = useTokenBalance(accountOrUndefined, newSwpr)

  const isUnsupportedNetworkModal = useModalOpen(ApplicationModal.UNSUPPORTED_NETWORK)
  const isUnsupportedChainIdError = useUnsupportedChainIdError()

  const networkWithoutSWPR = !newSwpr

  useEffect(() => {
    window.addEventListener('scroll', () => {
      const headerControls = document.getElementById('header-controls')
      if (headerControls) {
        if (window.scrollY > 0) {
          headerControls.classList.add('hidden')
        } else {
          headerControls.classList.remove('hidden')
        }
      }
    })
  }, [])

  return (
    <HeaderFrame>
      <ClaimModal
        onDismiss={toggleClaimPopup}
        newSwprBalance={newSwprBalance}
        stakedAmount={stakedTokenAmount?.toFixed(3)}
        singleSidedCampaignLink={
          data && !loading ? `/rewards/${data.stakeToken.address}/${data.address}/singleSidedStaking` : undefined
        }
      />
      <HeaderRow isDark={isDark}>
        <Title href=".">
          <SwaprVersionLogo />
        </Title>
        <HeaderLinks>
          <Divider />
          <HeaderLink id="swap-nav-link" to="/swap" activeClassName="active">
            {t('swap')}
          </HeaderLink>
          <HeaderLink id="pool-nav-link" to="/pools" activeClassName="active" disabled={networkWithoutSWPR}>
            Liquidity
            {networkWithoutSWPR && <HeaderLinkBadge label="NOT&nbsp;AVAILABLE" />}
          </HeaderLink>
          <HeaderLink id="rewards-nav-link" to="/rewards" activeClassName="active" disabled={networkWithoutSWPR}>
            Rewards
            {networkWithoutSWPR && <HeaderLinkBadge label="NOT&nbsp;AVAILABLE" />}
          </HeaderLink>
          <HeaderLink id="bridge-nav-link" to="/bridge" activeClassName="active">
            {t('bridge')}
            <HeaderLinkBadge label="BETA" />
          </HeaderLink>
          <HeaderLink id="vote-nav-link" href={`https://snapshot.org/#/swpr.eth`}>
            {t('vote')}
          </HeaderLink>
          <HeaderLink id="charts-nav-link" href={`https://dxstats.eth.limo/#/?chainId=${chainId}`}>
            {t('charts')}
            <Text ml="4px" fontSize="11px">
              ↗
            </Text>
          </HeaderLink>
        </HeaderLinks>
      </HeaderRow>
      <AdditionalDataWrap>
        <HeaderSubRow>
          <Web3Status />
          <Settings />
        </HeaderSubRow>

        <Flex maxHeight={'22px'} justifyContent={'end'}>
          {!networkWithoutSWPR && (
            <SwprInfo
              hasActiveCampaigns={!loading && !!data}
              newSwprBalance={newSwprBalance}
              onToggleClaimPopup={toggleClaimPopup}
            />
          )}
          <UnsupportedNetworkPopover show={isUnsupportedNetworkModal}>
            {isUnsupportedChainIdError && (
              <Amount data-testid="unsupported-network-warning" zero>
                {'UNSUPPORTED NETWORK'}
              </Amount>
            )}
            {account && !isUnsupportedChainIdError && (
              <Amount zero={!!userNativeCurrencyBalance?.equalTo('0')}>
                {userNativeCurrencyBalance ? (
                  `${userNativeCurrencyBalance.toFixed(3)} ${nativeCurrency.symbol}`
                ) : (
                  <Skeleton width="37px" style={{ marginRight: '3px' }} />
                )}
              </Amount>
            )}
          </UnsupportedNetworkPopover>
          {gas.normal !== 0.0 && (
            <GasInfo onClick={() => setIsGasInfoOpen(!isGasInfoOpen)} hide={!account || isUnsupportedChainIdError}>
              <GasInfoSvg />
              <Text marginLeft={'4px'} marginRight={'2px'} fontSize={10} fontWeight={600} lineHeight={'9px'}>
                {gas.normal}
              </Text>
              {gas.fast === 0 && gas.slow === 0 ? '' : <StyledChevron isOpen={isGasInfoOpen} size={12} />}
            </GasInfo>
          )}
        </Flex>
        {gas.fast !== 0 && gas.slow !== 0 && (
          <HeaderSubRow style={{ visibility: isGasInfoOpen ? 'visible' : 'hidden', gap: '4px' }}>
            <ColoredGas color={'fast'}>FAST {gas.fast}</ColoredGas>
            <ColoredGas color={'normal'}>NORMAL {gas.normal}</ColoredGas>
            <ColoredGas color={'slow'}>SLOW {gas.slow}</ColoredGas>
          </HeaderSubRow>
        )}
      </AdditionalDataWrap>
      <HeaderControls isConnected={!!account}>
        <Flex style={{ gap: '26px' }} minWidth={'unset'}>
          <HeaderMobileLink id="swap-nav-link" to="/swap" activeClassName="active">
            {t('swap')}
          </HeaderMobileLink>
          {!networkWithoutSWPR && (
            <HeaderMobileLink id="pool-nav-link" to="/pools" activeClassName="active">
              Pools
            </HeaderMobileLink>
          )}
          {!networkWithoutSWPR && (
            <HeaderMobileLink id="rewards-nav-link" to="/rewards" activeClassName="active">
              Rewards
            </HeaderMobileLink>
          )}
          <HeaderMobileLink id="bridge-nav-link" to="/bridge" activeClassName="active">
            {t('bridge')}
          </HeaderMobileLink>
          <HeaderMobileLink id="vote-nav-link" href={`https://snapshot.org/#/swpr.eth`}>
            {t('vote')}
          </HeaderMobileLink>
          <HeaderMobileLink id="stake-nav-link" href={`https://dxstats.eth.limo/#/?chainId=${chainId}`}>
            {t('charts')}
            <Text ml="4px" fontSize="11px">
              ↗
            </Text>
          </HeaderMobileLink>
        </Flex>

        <MoreLinksIcon>
          <MobileOptions />
        </MoreLinksIcon>
      </HeaderControls>
    </HeaderFrame>
  )
}

export default withRouter(Header)
