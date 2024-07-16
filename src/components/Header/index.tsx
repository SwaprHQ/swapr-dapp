import { useEffect, useState } from 'react'
import { ChevronUp } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ReactComponent as GasInfoSvg } from '../../assets/images/gas-info.svg'
import ShutterLogo from '../../assets/images/shutter-logo.svg'
import { LIQUIDITY_V3_INFO_POOLS_LINK, STACKLY_URL } from '../../constants'
import { useActiveWeb3React, useUnsupportedChainIdError } from '../../hooks'
import { useGasInfo } from '../../hooks/useGasInfo'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen } from '../../state/application/hooks'
import { useDarkModeManager, useUpdateSelectedChartOption } from '../../state/user/hooks'
import { ChartOption } from '../../state/user/reducer'
import { breakpoints } from '../../utils/theme'
import { ButtonPrimary } from '../Button'
import { UnsupportedNetworkPopover } from '../NetworkUnsupportedPopover'
import Row, { RowFixed, RowFlat } from '../Row'
import { Settings } from '../Settings'
import { SwaprVersionLogo } from '../SwaprVersionLogo'
import Web3Status from '../Web3Status'

import { Balances } from './Balances'
import { HeaderLink, HeaderMobileLink } from './HeaderLink'
import MobileOptions from './MobileOptions'
import { Amount } from './styled'

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
  height: 100px;
`

const ShutterButton = styled(ButtonPrimary)`
  background-image: ${({ disabled }) => !disabled && `linear-gradient(90deg, #2E17F2 19.74%, #FB52A1 120.26%)`};
  font-size: 10px;
  max-width: 165px;
  height: 22px;
  padding: 0px 8px;
  margin-right: 8px;
  gap: 10px;
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

const Title = styled(Link)`
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

  @media screen and (max-width: ${breakpoints.s}) {
    gap: 15px;
  }
`
const StyledChevron = styled(ChevronUp)<{ open: boolean }>`
  stroke: ${({ theme }) => theme.orange1};
  transform: ${({ open }) => (open ? 'rotate(0deg)' : 'rotate(180deg)')};
`

const NewBadge = styled.p`
  position: absolute;
  top: -16px;
  right: -26px;
  font-size: 10px;
  background: #3a9ee8;
  padding: 1px 6px;
  border-radius: 16px;
  color: black;
  line-height: 16px;
  font-weight: 600;
  margin-left: 10px;
`

function Header() {
  const { account, chainId } = useActiveWeb3React()

  const { t } = useTranslation('common')
  const [isGasInfoOpen, setIsGasInfoOpen] = useState(false)
  const { gas } = useGasInfo()
  const [isDark] = useDarkModeManager()

  /*  Expeditions hidden by SWA-27 request
   * const toggleExpeditionsPopup = useToggleShowExpeditionsPopup()
   */
  const isUnsupportedNetworkModal = useModalOpen(ApplicationModal.UNSUPPORTED_NETWORK)
  const isUnsupportedChainIdError = useUnsupportedChainIdError()

  const onScrollHander = () => {
    const headerControls = document.getElementById('header-controls')
    if (headerControls) {
      if (window.scrollY > 0) {
        headerControls.classList.add('hidden')
      } else {
        headerControls.classList.remove('hidden')
      }
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', onScrollHander)

    return () => {
      window.removeEventListener('scroll', onScrollHander)
    }
  }, [])

  const [selectedChartTab] = useUpdateSelectedChartOption()

  const swapRoute = selectedChartTab === ChartOption.PRO ? '/swap/pro' : '/swap'

  async function changeOrAddNetwork() {
    const chainId = '0x64'
    if (window.ethereum && window.ethereum.request) {
      try {
        const chainParams = {
          chainId: chainId,
          rpcUrls: ['https://erpc.gnosis.shutter.network'],
          chainName: 'Shutterized Gnosis Chain',
          nativeCurrency: {
            name: 'xDai',
            symbol: 'xDAI',
            decimals: 18,
          },
          blockExplorerUrls: ['https://www.gnosisscan.com'],
        }

        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [chainParams],
        })
        console.log('Network added and switched to:', chainParams.chainName)
      } catch (addError) {
        console.error('Failed to add the network:', addError)
      }
    } else {
      console.error('MetaMask is not installed!')
    }
  }

  return (
    <HeaderFrame>
      {/* Expeditions hidden by SWA-27 request */}
      {/* <ExpeditionsModal onDismiss={toggleExpeditionsPopup} /> */}
      <HeaderRow isDark={isDark}>
        <Title to={swapRoute}>
          <SwaprVersionLogo />
        </Title>
        <HeaderLinks>
          <Divider />
          <HeaderLink data-testid="swap-nav-link" id="swap-nav-link" to={swapRoute}>
            {t('swap')}
          </HeaderLink>
          <HeaderLink data-testid="bridge-nav-link" id="bridge-nav-link" to="/bridge">
            {t('bridge')}
          </HeaderLink>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <HeaderLink
              data-testid="liquidity-v3-nav-link"
              id="liquidity-v3-nav-link"
              href={LIQUIDITY_V3_INFO_POOLS_LINK}
            >
              {t('poolsV3')}
              <NewBadge>NEW</NewBadge>
            </HeaderLink>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              fill="#8780BF"
              viewBox="0 0 256 256"
              style={{ marginLeft: '4px', marginBottom: '2px' }}
            >
              <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z"></path>
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <HeaderLink id="stackly-nav-link" href={STACKLY_URL}>
              {t('DCA')}
            </HeaderLink>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              fill="#8780BF"
              viewBox="0 0 256 256"
              style={{ marginLeft: '4px', marginBottom: '2px' }}
            >
              <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z"></path>
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <HeaderLink id="vote-nav-link" href="https://snapshot.org/#/swpr.eth">
              {t('vote')}
            </HeaderLink>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              fill="#8780BF"
              viewBox="0 0 256 256"
              style={{ marginLeft: '4px', marginBottom: '2px' }}
            >
              <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z"></path>
            </svg>
          </div>
        </HeaderLinks>
      </HeaderRow>
      <AdditionalDataWrap>
        <HeaderSubRow>
          <Web3Status />
          <Settings />
        </HeaderSubRow>

        <Flex maxHeight="22px" justifyContent="end" width="325px">
          {account && (
            <>
              {/* Expeditions hidden by SWA-27 request */}
              {/* <HeaderButton onClick={toggleExpeditionsPopup} style={{ marginRight: '7px' }}>
                &#10024;&nbsp;Expeditions
              </HeaderButton> */}
              <ShutterButton onClick={changeOrAddNetwork}>
                <img src={ShutterLogo} alt="Shutter logotype" /> ADD SHUTTER RPC
              </ShutterButton>
              <Balances />
            </>
          )}
          <UnsupportedNetworkPopover show={isUnsupportedNetworkModal}>
            {isUnsupportedChainIdError && (
              <Amount data-testid="unsupported-network-warning" zero>
                {'UNSUPPORTED NETWORK'}
              </Amount>
            )}
          </UnsupportedNetworkPopover>
          {gas.normal !== 0.0 && (
            <GasInfo onClick={() => setIsGasInfoOpen(!isGasInfoOpen)} hide={!account || isUnsupportedChainIdError}>
              <GasInfoSvg />
              <Text marginLeft={'4px'} marginRight={'2px'} fontSize={10} fontWeight={600} lineHeight={'9px'}>
                {gas.normal}
              </Text>
              {gas.fast === 0 && gas.slow === 0 ? '' : <StyledChevron open={isGasInfoOpen} size={12} />}
            </GasInfo>
          )}
        </Flex>
        {gas.fast !== 0 && gas.slow !== 0 && (
          <HeaderSubRow
            style={{
              visibility: isGasInfoOpen ? 'visible' : 'hidden',
              gap: '4px',
            }}
          >
            <ColoredGas color={'fast'}>FAST {gas.fast}</ColoredGas>
            <ColoredGas color={'normal'}>NORMAL {gas.normal}</ColoredGas>
            <ColoredGas color={'slow'}>SLOW {gas.slow}</ColoredGas>
          </HeaderSubRow>
        )}
      </AdditionalDataWrap>
      <HeaderControls isConnected={!!account}>
        <Flex style={{ gap: '26px' }} minWidth={'unset'}>
          <HeaderMobileLink id="swap-nav-link" to="/swap">
            {t('swap')}
          </HeaderMobileLink>
          <HeaderMobileLink id="bridge-nav-link" to="/bridge">
            {t('bridge')}
          </HeaderMobileLink>
          <HeaderMobileLink id="liquidity-v3-nav-link" href={LIQUIDITY_V3_INFO_POOLS_LINK}>
            {t('poolsV3')}
            <Text ml="4px" fontSize="11px">
              ↗
            </Text>
          </HeaderMobileLink>

          <HeaderMobileLink id="stackly-nav-link" href={STACKLY_URL}>
            {t('DCA')}
            <Text ml="4px" fontSize="11px">
              ↗
            </Text>
          </HeaderMobileLink>
          <HeaderMobileLink id="vote-nav-link" href={`https://snapshot.org/#/swpr.eth`}>
            {t('vote')}
            <Text ml="4px" fontSize="11px">
              ↗
            </Text>
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

export default Header
