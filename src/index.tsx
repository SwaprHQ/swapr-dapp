import { setUseWhatChange } from '@simbathesailor/use-what-changed'
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'

import { AnalyticsProvider } from './analytics'
import { NetworkContextName } from './constants'
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
import getLibrary from './utils/getLibrary'
import './theme/fonts.css'

// Add Content Security Policy nonce to the scripts
__webpack_nonce__ = process.env.REACT_APP_CSP_NONCE!

// Enables use of the useWhatChanged hook in dev environment
setUseWhatChange({
  active: process.env.NODE_ENV === 'development',
})

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

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

root.render(
  <StrictMode>
    <FixedGlobalStyle />
    <AnalyticsProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ProviderNetwork getLibrary={getLibrary}>
          <Provider store={store}>
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
          </Provider>
        </Web3ProviderNetwork>
      </Web3ReactProvider>
    </AnalyticsProvider>
  </StrictMode>
)
