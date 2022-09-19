import { setUseWhatChange } from '@simbathesailor/use-what-changed'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'

import { AnalyticsProvider } from './analytics'
import { Web3Provider } from './components/Web3Provider'
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
import './theme/fonts.css'

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

root.render(
  <StrictMode>
    <FixedGlobalStyle />
    <AnalyticsProvider>
      <Provider store={store}>
        <Web3Provider>
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
        </Web3Provider>
      </Provider>
    </AnalyticsProvider>
  </StrictMode>
)
