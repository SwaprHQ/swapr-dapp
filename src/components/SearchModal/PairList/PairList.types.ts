import { Pair } from '@swapr/sdk'

import { CSSProperties } from 'react'

export interface PairRowProps {
  pair: Pair
  style: CSSProperties
  onSelect: () => void
  isSelected: boolean
}

export interface PairListProps {
  pairs: Pair[]
  otherPair?: Pair | null
  onPairSelect: (pair: Pair) => void
  selectedPair?: Pair | null
}
