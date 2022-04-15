import { CSSProperties } from 'react'
import { Pair } from '@swapr/sdk'

export interface PairRowProps {
  pair: Pair
  onSelect: () => void
  isSelected: boolean
  style: CSSProperties
}

export interface PairListProps {
  pairs: Pair[]
  selectedPair?: Pair | null
  onPairSelect: (pair: Pair) => void
  otherPair?: Pair | null
}
