import { Pair } from '@swapr/sdk'

import { useCallback } from 'react'

import { PairSearchModalProps } from './PairSearchModal.types'
import Modal from '../../Modal'
import { PairSearch } from '../PairSearch'

export const PairSearchModal = ({
  isOpen,
  onDismiss,
  filterPairs,
  onPairSelect,
  selectedPair,
}: PairSearchModalProps) => {
  const handlePairSelect = useCallback(
    (pair: Pair) => {
      onPairSelect(pair)
      onDismiss()
    },
    [onDismiss, onPairSelect]
  )

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={60} minHeight={60}>
      <PairSearch
        isOpen={isOpen}
        onDismiss={onDismiss}
        onPairSelect={handlePairSelect}
        selectedPair={selectedPair}
        filterPairs={filterPairs}
      />
    </Modal>
  )
}
