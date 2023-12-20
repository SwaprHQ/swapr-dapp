import { CurrencyAmount } from '@swapr/sdk'

import { useCallback } from 'react'

import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../../../../../components/TransactionConfirmationModal'
import { Kind, LimitOrderBase, MarketPrices, Providers } from '../../../../../services/LimitOrders'
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
  protocol: LimitOrderBase
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

  protocol,
}: ConfirmLimitOrderModalProps) {
  const {
    buyAmount,
    sellAmount,
    limitPrice,
    expiresAt,
    expiresAtUnit,
    kind,
    limitOrderProtocol = Providers.COW,
  } = protocol

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
    kind ?? Kind.Sell,
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
        market={`${limitOrderProtocol} Protocol`}
        isDiffPositive={isDiffPositive}
      />
    ) : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
