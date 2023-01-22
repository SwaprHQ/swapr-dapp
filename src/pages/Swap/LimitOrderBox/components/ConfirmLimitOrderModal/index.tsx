import { CurrencyAmount } from '@swapr/sdk'

import { useCallback, useContext } from 'react'

import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../../../../../components/TransactionConfirmationModal'
import { LimitOrderFormContext } from '../../contexts'
import { LimitOrderKind } from '../../interfaces'
import { calculateMarketPriceDiffPercentage } from '../../utils'
import { ConfirmationFooter } from './ConfirmationFooter'
import { ConfirmationHeader } from './ConfirmationHeader'

interface ConfirmLimitOrderModalProps {
  isOpen: boolean
  attemptingTxn: boolean
  errorMessage: string | undefined
  fiatValueInput: CurrencyAmount | null
  fiatValueOutput: CurrencyAmount | null
  onDismiss: () => void
  onConfirm: () => void
}

export default function ConfirmLimitOrderModal({
  isOpen,
  attemptingTxn,
  errorMessage,
  fiatValueInput,
  fiatValueOutput,
  onDismiss,
  onConfirm,
}: ConfirmLimitOrderModalProps) {
  const { expiresIn, expiresInUnit, limitOrder, buyTokenAmount, sellTokenAmount, formattedLimitPrice, marketPrices } =
    useContext(LimitOrderFormContext)

  const [baseTokenAmount, quoteTokenAmount] =
    limitOrder.kind === LimitOrderKind.SELL ? [sellTokenAmount, buyTokenAmount] : [buyTokenAmount, sellTokenAmount]
  const askPrice = `${limitOrder.kind} ${baseTokenAmount?.currency?.symbol} at ${formattedLimitPrice} ${quoteTokenAmount?.currency?.symbol}`

  let { marketPriceDiffPercentage, isDiffPositive } = calculateMarketPriceDiffPercentage(
    limitOrder.kind,
    marketPrices,
    formattedLimitPrice
  )
  const expiresInFormatted = `${expiresIn} ${expiresInUnit}`

  //hardcoded for now
  const market = 'CoW Protocol'

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
