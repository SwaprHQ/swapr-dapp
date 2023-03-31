# `Swapbox 2.0 🍀`

Welcome friend! 👋

This folder contains new, re-designed `Swapbox 2023` by `dxDAO`. Current version is the first iteration and further plan is to continue working on this, designing new things, update the current ones, adding new features and improve the existing ones.

## Folder Structure

It is important to mention, `Swapbox 2023` is wrapped with `SwapContext` which takes care of some states of the swapbox. It tracks currencies, currency balances, currency amounts, available swapping platforms, currently selected swapping platform, loading state, etc. `SwapContext` is located outside of this folder, its data model is presented below:

```typescript
type SwapContextType = {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  allPlatformTrades: (Trade | undefined)[] | undefined
  trade: Trade | undefined
  inputError?: number
  loading: boolean
  platformOverride: PlatformOverride
  setPlatformOverride: Dispatch<SetStateAction<PlatformOverride>>
}
```

The folder contains few other folders and files, I'll go through them and try to explain the responsibility of each and the idea behind it. Folder tree presented below:

```
.
├── components
├── constants
├── models
├── utils
├── README.md ✅
├── Swapbox.tsx
├── index.ts ✅
└── useSwapbox.ts ✅
```

### `index.tsx`

`index.tsx` is the main file exported from this folder. It doesn't contain much, the only functionality it has is the composition of `Swapbox 2023` with `Hero` and `LandingSections` components into the page. This page is exported as the main component.

### `useSwapbox.ts`

`useSwapbox.ts` is the hook which powers `Swapbox 2023`; it contains 90% of the implementation logic that is being used to operate the swapbox. This hook is derived from the previous swapbox implementation with the idea to group the logic, keep it on the same place and in that way enable modularity, readability, maintainability and further development by isolation.

The hook keeps track of some state values in itself, it uses the values from above mentioned `SwapContext`, extends them, derives new values from them and uses other external hooks to create functionalities through the functions which are exported from the hook for further usage in `Swapbox 2023`. Exported values / functions presented below:

```typescript
export const useSwapbox = () => {
  // ...
  // IMPLEMENTATION LOGIC
  // ...

  return {
    // CURRENCIES
    currencies,
    priceImpact,
    priceImpactSeverity,

    // AMOUNT of CURRENCIES
    formattedAmounts,
    handleTypeInput,
    handleTypeOutput,
    isInputPanelDisabled,

    // AMOUNT WORTH
    fiatValueInput,
    fiatValueOutput,
    isFallbackFiatValueInput,
    isFallbackFiatValueOutput,

    // CURRENCY SELECT
    handleMaxInput,
    handleInputSelect,
    handleOutputSelect,
    maxAmountInput,
    maxAmountOutput,

    // SWITCH CURRENCIES
    onSwitchTokens,

    // LOADING
    loading,

    // SWAP INFO
    allPlatformTrades,
    trade,
    swapCallbackError,

    // SWAP BUTTON
    swapInputError,
    handleSwap,

    // WRAPPING
    showWrap,
    wrapInputError,
    wrapState,
    onWrap,
    wrapType,
    setWrapState,

    // APPROVE FLOW
    showApproveFlow,
    approveCallback,
    approval,

    // CONFIRM SWAP MODAL
    swapErrorMessage,
    recipient,
  }
}
```
