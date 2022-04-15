import { Pair } from '@swapr/sdk'

export interface PairSearchProps {
  isOpen: boolean
  onDismiss: () => void
  selectedPair?: Pair | null
  onPairSelect: (pair: Pair) => void
  showCommonBases?: boolean
  filterPairs?: (pair: Pair) => boolean
}
