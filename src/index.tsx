import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'

import { coinbaseWallet, hooks as coinbaseWalletHooks } from './connectors/coinbaseWallet'
import { metaMask, hooks as metaMaskHooks } from './connectors/metaMask'
import { network, hooks as networkHooks } from './connectors/network'
import { walletConnect, hooks as walletConnectHooks } from './connectors/walletConnect'
import { NetworkContextName } from './constants'
import './i18n'
import App from './pages/App'
import { EcoBridgeProvider } from './services/EcoBridge/EcoBridgeProvider'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import FeesUpdater from './state/fees/updater'
import TokenListUpdater from './state/lists/updater'
import MultiChainLinksUpdater from './state/multi-chain-links/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme'
import getLibrary from './utils/getLibrary'

if ('ethereum' in window) {
  ;(window.ethereum as any).autoRefreshOnNetworkChange = false
}

window.addEventListener('error', error => {
  console.error(`${error.message} @ ${error.filename}:${error.lineno}:${error.colno}`)
})

const connectors: [MetaMask | WalletConnect | CoinbaseWallet | Network, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [network, networkHooks],
]

function Updaters() {
  return (
    <>
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
      <FeesUpdater />
      <TokenListUpdater />
    </>
  )
}

ReactDOM.render(
  <StrictMode>
    <FixedGlobalStyle />
    <Web3ReactProvider connectors={connectors}>
      <Provider store={store}>
        <EcoBridgeProvider>
          <Updaters />
          <ThemeProvider>
            <ThemedGlobalStyle />
            <HashRouter>
              <MultiChainLinksUpdater />
              <App />
            </HashRouter>
          </ThemeProvider>
        </EcoBridgeProvider>
      </Provider>
    </Web3ReactProvider>
  </StrictMode>,
  document.getElementById('root')
)
