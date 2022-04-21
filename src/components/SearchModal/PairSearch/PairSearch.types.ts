import { Pair } from '@swapr/sdk'

export interface PairSearchProps {
  isOpen: boolean
  onDismiss: () => void
  onPairSelect: (pair: Pair) => void
  selectedPair?: Pair | null
  filterPairs?: (pair: Pair) => boolean
  showCommonBases?: boolean
}
