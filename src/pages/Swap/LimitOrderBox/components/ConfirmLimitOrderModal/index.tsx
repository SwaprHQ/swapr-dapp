import { CurrencyAmount } from '@swapr/sdk'

import { useCallback, useContext } from 'react'

import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../../../../../components/TransactionConfirmationModal'
import { LimitOrderFormContext } from '../../contexts'
import { LimitOrderKind } from '../../interfaces'
import { calcualtePriceDiffPercentage } from '../OrderLimitPriceField'
import { ConfirmationFooter } from './ConfirmationFooter'
import { ConfirmationHeader } from './ConfirmationHeader'

export default function ConfirmLimitOrderModal({
  onConfirm,
  onDismiss,
  errorMessage,
  isOpen,
  attemptingTxn,
  fiatValueInput,
  fiatValueOutput,
}: {
  isOpen: boolean
  attemptingTxn: boolean
  onConfirm: () => void
  errorMessage: string | undefined
  onDismiss: () => void
  fiatValueInput: CurrencyAmount | null
  fiatValueOutput: CurrencyAmount | null
}) {
  const { expiresIn, expiresInUnit, limitOrder, buyTokenAmount, sellTokenAmount, formattedLimitPrice, marketPrices } =
    useContext(LimitOrderFormContext)

  const [baseTokenAmount, quoteTokenAmount] =
    limitOrder.kind === LimitOrderKind.SELL ? [sellTokenAmount, buyTokenAmount] : [buyTokenAmount, sellTokenAmount]
  const askPrice = `${limitOrder.kind} ${baseTokenAmount?.currency?.symbol} at ${formattedLimitPrice} ${quoteTokenAmount?.currency?.symbol}`

  let { marketPriceDiffPercentage, isDiffPositive } = calcualtePriceDiffPercentage(
    limitOrder,
    marketPrices,
    formattedLimitPrice
  )
  const expiresInFormatted = `${expiresIn} ${expiresInUnit}`

  //hardcoded for now
  const market = 'Cow Protocol'

  const modalHeader = useCallback(() => {
    return (
      <ConfirmationHeader
        fiatValueInput={fiatValueInput}
        fiatValueOutput={fiatValueOutput}
        buyToken={buyTokenAmount}
        sellToken={sellTokenAmount}
      />
    )
  }, [fiatValueInput, fiatValueOutput, buyTokenAmount, sellTokenAmount])

  const modalBottom = useCallback(() => {
    return onConfirm ? (
      <ConfirmationFooter
        onConfirm={onConfirm}
        askPrice={askPrice}
        expiresIn={expiresInFormatted}
        marketPriceDifference={marketPriceDiffPercentage}
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
