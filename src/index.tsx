import { setUseWhatChange } from '@simbathesailor/use-what-changed'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import { HashRouter } from 'react-router-dom'

import { AnalyticsProvider } from './analytics'
import {
  metaMask,
  metaMaskHooks,
  walletConnect,
  walletConnectHooks,
  coinbaseWallet,
  coinbaseWalletHooks,
  network,
  networkHooks,
} from './connectors'
import './i18n'
import App from './pages/App'
import { LimitOrderFromProvider } from './pages/Swap/LimitOrderBox/contexts/LimitOrderFormProvider'
import { SwapProvider } from './pages/Swap/SwapBox/SwapProvider'
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
import './theme/fonts.css'

// Add Content Security Policy nonce to the scripts
__webpack_nonce__ = process.env.REACT_APP_CSP_NONCE!

// Enables use of the useWhatChanged hook in dev environment
setUseWhatChange({
  active: process.env.NODE_ENV === 'development',
})

if ('ethereum' in window) {
  ;(window.ethereum as any).autoRefreshOnNetworkChange = false
}

window.addEventListener('error', error => {
  console.error(`${error.message} @ ${error.filename}:${error.lineno}:${error.colno}`)
})

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

const container = document.getElementById('root')!
const root = createRoot(container)
export const queryClient = new QueryClient()

const connectors: [Connector, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [network, networkHooks],
]

root.render(
  <StrictMode>
    <FixedGlobalStyle />
    <AnalyticsProvider>
      <Web3ReactProvider connectors={connectors}>
        <ReduxProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <EcoBridgeProvider>
              <Updaters />
              <ThemeProvider>
                <ThemedGlobalStyle />

                <HashRouter>
                  <MultiChainLinksUpdater />
                  <SwapProvider>
                    <LimitOrderFromProvider>
                      <App />
                    </LimitOrderFromProvider>
                  </SwapProvider>
                </HashRouter>
              </ThemeProvider>
            </EcoBridgeProvider>
          </QueryClientProvider>
        </ReduxProvider>
      </Web3ReactProvider>
    </AnalyticsProvider>
  </StrictMode>
)
