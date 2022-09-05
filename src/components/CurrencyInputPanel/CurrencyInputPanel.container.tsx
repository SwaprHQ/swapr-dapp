import { useAutoMaxBalance } from '../../hooks/useAutoMaxBalance'
import { useBridgeInputValidation } from '../../pages/Bridge/ActionPanel/useBridgeInputValidation'
import { CurrencyWrapperSource } from '../CurrencyLogo'
import { CurrencySearchModalProvider } from '../SearchModal/CurrencySearchModal/CurrencySearchModal.container'
import {
  useCurrencySearchModalBridge,
  useCurrencySearchModalSwap,
} from '../SearchModal/CurrencySearchModal/CurrencySearchModal.hooks'
import { CurrencyInputPanelComponent } from './CurrencyInputPanel.component'
import { CurrencyInputPanelProps } from './CurrencyInputPanel.types'

export const CurrencyInputPanel = (currencyInputPanelProps: CurrencyInputPanelProps) => {
  const searchModalContexts = useCurrencySearchModalSwap()
  const { onMax, onCurrencySelect } = currencyInputPanelProps

  const { handleOnCurrencySelect } = useAutoMaxBalance({
    onMax,
    onCurrencySelect,
  })

  return (
    <CurrencySearchModalProvider {...searchModalContexts}>
      <CurrencyInputPanelComponent {...currencyInputPanelProps} onCurrencySelect={handleOnCurrencySelect} />
    </CurrencySearchModalProvider>
  )
}

export const CurrencyInputPanelBridge = (currencyInputPanelProps: CurrencyInputPanelProps) => {
  const searchModalContexts = useCurrencySearchModalBridge()

  const { value, onUserInput, displayedValue, disableCurrencySelect, isOutputPanel } = currencyInputPanelProps
  const { onMax, onCurrencySelect } = currencyInputPanelProps

  const { handleOnCurrencySelect } = useAutoMaxBalance({
    onMax,
    onCurrencySelect,
  })

  useBridgeInputValidation(!!disableCurrencySelect, Boolean(isOutputPanel))

  return (
    <CurrencySearchModalProvider {...searchModalContexts}>
      <CurrencyInputPanelComponent
        {...currencyInputPanelProps}
        value={value}
        onUserInput={onUserInput}
        displayedValue={displayedValue}
        currencyWrapperSource={CurrencyWrapperSource.BRIDGE}
        onCurrencySelect={handleOnCurrencySelect}
      />
    </CurrencySearchModalProvider>
  )
}
