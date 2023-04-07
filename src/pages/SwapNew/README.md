# `Swapbox 2.0 🍀`

## Introduction

Welcome friend! 👋

This folder contains a new, re-designed swapbox, `Swapbox 2023` by `dxDAO`. Current version is the first iteration and further plan is to continue working on this, designing new things, updating the current ones, adding new features and improving the existing ones.

## `SwapContext`

It is important to mention, the `Swapbox 2023` is wrapped with `SwapContext` which takes care of some states of the swapbox. It tracks currencies, currency balances, currency amounts, available swapping platforms, currently selected swapping platform, loading state, etc. `SwapContext` is located outside of this folder, its data model is presented below:

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

## Folder Structure

The folder contains a few other folders and files, I'll go through them and try to explain the responsibility of each and the idea behind it. Folder tree presented below:

```
.
├── 📁 components
├── 📁 constants
├── 📁 models
├── 📄 index.ts
├── 📄 README.md
├── 📄 Swapbox.tsx
└── 📄 useSwapbox.ts
```

### `models`

This folder contains some of the models that are being used in the swapbox.

### `useSwapbox.ts`

`useSwapbox.ts` is the hook which powers the `Swapbox 2023`; it contains 90% of the implementation logic that is being used to operate the swapbox. This hook is derived from the previous swapbox implementation with the idea to group the logic, keep it in the same place and in that way enable modularity, readability, maintainability and further development by isolation.

The hook keeps track of some state values in itself, it uses the values from above mentioned `SwapContext`, extends them, derives new values from them and uses other external hooks to create functionalities through the functions which are exported from the hook for further usage in the `Swapbox 2023`. Exported values / functions presented below:

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

### `constants`

This folder currently contains only UI related stuff. The idea behind is to extract UI values which provide styling for the `Swapbox 2023` into the variables. Those are the colors that are being used across the components, the swapbox dimensions, border stylings, elements spacing, indicator types and styling helper functions. If necessary in the future, since all of these are in the same place and all values are being referenced from it, it is really easy to change the looks of the swapbox and it would be really easy to introduce theming with minimal amount of work.

### `components`

`components` folder contains all of the components that are being used in the `Swapbox 2023`. The components are split by the functionalities they are responsible for. Root level components are assigned its own folder and their sub-components are kept inside it. Root level components are `CurrencyItem`, `SwitchCurrenciesButton`, `SwapInfo`, `SwapboxButton` and `TokenPicker`. As mentioned above, the idea for the components is to mainly focus them on the UI part and keep as little logic as possible inside them. The only logic that can be kept inside is something specific for them and only used in that one place. The components should receive everything necessary for their functioning through the props.

In future, in order to avoid prop drilling with values and functions, everything can be taken to the next level with dedicated state management solution. We should keep track both of the values and functions in one place and in that case ensure that each of the components can be independent and take everything they need directly from the centralized storage.

### `Swapbox.tsx`

`Swapbox.tsx` is the root component which basically assembles the `Swapbox 2023`. This is where the references from `useSwapbox.ts` hook are being unpacked and further fed to the components which need them for functioning.

### `index.tsx`

`index.tsx` is the main file exported from this folder. It doesn't contain much, the only functionality it has is the composition of the `Swapbox 2023` with `Hero` and `LandingSections` components into the page. This page is exported as the main component.
