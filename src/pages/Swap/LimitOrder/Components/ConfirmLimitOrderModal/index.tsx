import { CurrencyAmount } from '@swapr/sdk'

import { useCallback, useContext } from 'react'

import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../../../../../components/TransactionConfirmationModal'
import { Kind, LimitOrderContext, MarketPrices } from '../../../../../services/LimitOrders'
import { calculateMarketPriceDiffPercentage } from '../utils'

import { ConfirmationFooter } from './ConfirmationFooter'
import { ConfirmationHeader } from './ConfirmationHeader'

interface ConfirmLimitOrderModalProps {
  isOpen: boolean
  attemptingTxn: boolean
  errorMessage: string | undefined
  onDismiss: () => void
  onConfirm: () => void
  marketPrices: MarketPrices
  fiatValueInput: CurrencyAmount | null
  fiatValueOutput: CurrencyAmount | null
}

export default function ConfirmLimitOrderModal({
  onConfirm,
  onDismiss,
  errorMessage,
  isOpen,
  attemptingTxn,
  marketPrices,
  fiatValueInput,
  fiatValueOutput,
}: ConfirmLimitOrderModalProps) {
  const { limitOrder, buyAmount, sellAmount, limitPrice, expiresAt, expiresAtUnit, kind } =
    useContext(LimitOrderContext)

  //hardcoded for now
  const market = 'CoW Protocol'

  const modalHeader = useCallback(() => {
    return (
      <ConfirmationHeader
        fiatValueInput={fiatValueInput}
        fiatValueOutput={fiatValueOutput}
        buyToken={buyAmount}
        sellToken={sellAmount}
      />
    )
  }, [fiatValueInput, fiatValueOutput, buyAmount, sellAmount])

  const [baseTokenAmount, quoteTokenAmount] = kind === Kind.Sell ? [sellAmount, buyAmount] : [buyAmount, sellAmount]
  const askPrice = `${kind} ${baseTokenAmount?.currency?.symbol} at ${limitPrice} ${quoteTokenAmount?.currency?.symbol}`

  let { marketPriceDiffPercentage, isDiffPositive } = calculateMarketPriceDiffPercentage(
    limitOrder!.kind,
    marketPrices,
    limitPrice!
  )
  const expiresInFormatted = `${expiresAt} ${expiresAtUnit}`

  const modalBottom = useCallback(() => {
    return onConfirm ? (
      <ConfirmationFooter
        onConfirm={onConfirm}
        askPrice={askPrice}
        expiresIn={expiresInFormatted}
        marketPriceDifference={marketPriceDiffPercentage.toFixed(2)}
        market={market}
        isDiffPositive={isDiffPositive}
      />
    ) : null
  }, [marketPriceDiffPercentage, isDiffPositive, onConfirm, askPrice, expiresInFormatted])

  // text to show while loading
  const pendingText = 'Confirm Signature'

  const confirmationContent = useCallback(
    () =>
      errorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={errorMessage} />
      ) : (
        <ConfirmationModalContent
          title="Confirm Limit Order"
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, modalHeader, errorMessage]
  )

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      content={confirmationContent}
      pendingText={pendingText}
    />
  )
}
