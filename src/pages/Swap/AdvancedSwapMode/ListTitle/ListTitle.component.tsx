import React from 'react'

import { ListTitleElement, ListTitleRow } from './ListTitle.styles'

export const ListTitle = () => {
  return (
    <ListTitleRow>
      <ListTitleElement>USD</ListTitleElement>
      <ListTitleElement>Amount</ListTitleElement>
      <ListTitleElement>Time</ListTitleElement>
    </ListTitleRow>
  )
}
