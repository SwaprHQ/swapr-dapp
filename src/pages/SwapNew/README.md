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
├── README.md
├── Swapbox.tsx
├── index.ts
└── useSwapbox.ts
```
