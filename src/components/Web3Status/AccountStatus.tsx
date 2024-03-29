import { ChainId } from '@swapr/sdk'

import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect-v2'
import { useEffect, useState } from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'

import ArbitrumLogo from '../../assets/images/arbitrum-one-logo.svg'
import BSCLogo from '../../assets/images/binance-chain-logo.svg'
import EthereumLogo from '../../assets/images/ethereum-logo.svg'
import GnosisLogo from '../../assets/images/gnosis-chain-logo.svg'
import OptimismLogo from '../../assets/images/optimism-logo.svg'
import PolygonMaticLogo from '../../assets/images/polygon-matic-logo.svg'
import ScrollLogo from '../../assets/images/scroll-logo.svg'
import ZkSyncEraLogo from '../../assets/images/zk-sync-era-logo.svg'
import { ENSAvatarData } from '../../hooks/useENSAvatar'
import { ApplicationModal } from '../../state/application/actions'
import { useNetworkSwitcherPopoverToggle } from '../../state/application/hooks'
import { shortenAddress } from '../../utils'
import { TriangleIcon } from '../Icons'
import { Loader } from '../Loader'
import NetworkSwitcherPopover from '../NetworkSwitcherPopover'
import { RowBetween } from '../Row'

const ChainLogo: any = {
  [ChainId.ARBITRUM_GOERLI]: ArbitrumLogo,
  [ChainId.ARBITRUM_ONE]: ArbitrumLogo,
  [ChainId.ARBITRUM_RINKEBY]: ArbitrumLogo,
  [ChainId.BSC_MAINNET]: BSCLogo,
  [ChainId.GOERLI]: EthereumLogo,
  [ChainId.MAINNET]: EthereumLogo,
  [ChainId.OPTIMISM_GOERLI]: OptimismLogo,
  [ChainId.OPTIMISM_MAINNET]: OptimismLogo,
  [ChainId.POLYGON]: PolygonMaticLogo,
  [ChainId.RINKEBY]: EthereumLogo,
  [ChainId.SCROLL_MAINNET]: ScrollLogo,
  [ChainId.XDAI]: GnosisLogo,
  [ChainId.ZK_SYNC_ERA_MAINNET]: ZkSyncEraLogo,
  [ChainId.ZK_SYNC_ERA_TESTNET]: ZkSyncEraLogo,
}

const View = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  margin-left: auto;
  background-color: ${({ theme }) => theme.dark1};
  border: solid 2px transparent;
  color: ${({ theme }) => theme.purple2};
  border-radius: 12px;
  white-space: nowrap;
  margin-left: 8px;
  padding: 1px;
`

const Web3StatusConnected = styled.button<{ pending?: boolean }>`
  height: 29px;
  padding: 0 8px;
  background: none;
  border: none;
  color: ${({ pending, theme }) => (pending ? theme.white : theme.text4)};
  font-weight: 700;
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
`

const Web3StatusNetwork = styled.button<{
  pendingTransactions?: boolean
  isConnected: boolean
  clickable: boolean
}>`
  display: flex;
  align-items: center;
  height: 26px;
  padding: 7px 8px;
  font-size: 12px;
  line-height: 15px;
  text-align: center;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ffffff;
  border-radius: 10px;
  background-color: ${({ theme, isConnected }) => (isConnected ? theme.dark2 : 'transparent')};
  border: none;
  outline: none;
  cursor: ${props => (props.clickable ? 'pointer' : 'initial')};
`

const IconWrapper = styled.div<{ size?: number | null }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;

  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '30px')};
    width: ${({ size }) => (size ? size + 'px' : '30px')};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: center;
  `};
`

const AddressDesktop = styled.span`
  display: block;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `};
`

const AddressMobile = styled.span`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: block;
  `};
`

export interface StyledAvatarProps {
  url: string
}

const Avatar = styled.div<StyledAvatarProps>(props => ({
  height: 32,
  width: 32,
  borderRadius: '50%',
  marginRight: 6,
  marginLeft: -14,
  backgroundColor: props.theme.bg1,
  backgroundSize: 'cover',
  backgroundImage: `url(${props.url})`,
}))

interface AccountStatusProps {
  pendingTransactions: string[]
  ENSName?: string
  avatar?: ENSAvatarData
  account: string | undefined | null
  connector: Connector | undefined
  networkConnectorChainId: ChainId | undefined
  onAddressClick: () => void
}

export function AccountStatus({
  pendingTransactions,
  ENSName,
  account,
  connector,
  networkConnectorChainId,
  onAddressClick,
  avatar,
}: AccountStatusProps) {
  const hasPendingTransactions = !!pendingTransactions.length
  const toggleNetworkSwitcherPopover = useNetworkSwitcherPopoverToggle()
  const [networkSwitchingActive, setNetworkSwitchingActive] = useState(false)

  useEffect(() => {
    setNetworkSwitchingActive(
      connector instanceof Network ||
        connector instanceof MetaMask ||
        connector instanceof WalletConnect ||
        connector instanceof CoinbaseWallet
    )
  }, [connector])

  if (!networkConnectorChainId) return null

  return (
    <View>
      {account && (
        <Web3StatusConnected id="web3-status-connected" onClick={onAddressClick} pending={hasPendingTransactions}>
          {hasPendingTransactions ? (
            <RowBetween>
              <Text fontSize={13} marginRight="5px">
                {pendingTransactions?.length} Pending
              </Text>{' '}
              <Loader />
            </RowBetween>
          ) : ENSName ? (
            <>
              {avatar?.image && <Avatar url={avatar.image} />}
              <p>{ENSName}</p>
            </>
          ) : (
            <>
              <AddressDesktop>{shortenAddress(account)}</AddressDesktop>
              <AddressMobile>{shortenAddress(account, 2)}</AddressMobile>
            </>
          )}
        </Web3StatusConnected>
      )}
      <NetworkSwitcherPopover modal={ApplicationModal.NETWORK_SWITCHER} placement="bottom-end">
        <Web3StatusNetwork
          clickable={networkSwitchingActive}
          onClick={networkSwitchingActive ? toggleNetworkSwitcherPopover : undefined}
          isConnected={!!account}
        >
          <IconWrapper size={20}>
            <img src={ChainLogo[networkConnectorChainId]} alt="chain logo" />
          </IconWrapper>
          {networkSwitchingActive && <TriangleIcon />}
        </Web3StatusNetwork>
      </NetworkSwitcherPopover>
    </View>
  )
}
