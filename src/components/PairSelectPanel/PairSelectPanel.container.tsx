import { useCallback, useState } from 'react'

import { useAutoMaxBalance } from '../../hooks/useAutoMaxBalance'
import { PairSearchModal } from '../SearchModal/PairSearchModal/index'
import { PairSelectPanelComponent } from './PairSelectPanel.component'
import { PairSelectPanelProps } from './PairSelectPanel.types'

export const PairSelectPanel = (pairSelectPanelProps: PairSelectPanelProps) => {
  return <PairSelectPanelComponent {...pairSelectPanelProps} />
}
