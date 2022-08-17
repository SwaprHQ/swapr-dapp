import { useCallback, useState } from 'react'

import { useAutoMaxBalance } from '../../hooks/useAutoMaxBalance'
import { PairSearchModal } from '../SearchModal/PairSearchModal/index'
import { PairSelectPanelComponent } from './PairSelectPanel.component'
import { PairSelectPanelProps } from './PairSelectPanel.types'

export const PairSelectPanel = (pairSelectPanelProps: PairSelectPanelProps) => {
  const { onMax, onCurrencySelect } = pairSelectPanelProps
  const [openPairsModal, setOpenPairsModal] = useState(false)
  const { handleOnCurrencySelect } = useAutoMaxBalance({
    onMax,
    onCurrencySelect,
  })
  const handleModalClose = useCallback(() => {
    setOpenPairsModal(false)
  }, [])
  const handlePairSelect = useCallback(() => {
    console.log('pair selected')
    setOpenPairsModal(true)
  }, [])

  return <PairSelectPanelComponent {...pairSelectPanelProps} />
}
