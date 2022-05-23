import React from 'react'

import { CursorText } from './SortButton.styles'

import { SortButtonProps } from './SortButton.types'

export const SortButton = ({ toggleSortOrder, ascending }: SortButtonProps) => {
  return (
    <CursorText fontSize={14} fontWeight={500} onClick={toggleSortOrder}>
      {ascending ? '↑' : '↓'}
    </CursorText>
  )
}
