import { Pair } from '@swapr/sdk'

export interface PairSearchModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedPair?: Pair | null
  onPairSelect: (pair: Pair) => void
  filterPairs?: (pair: Pair) => boolean
}
