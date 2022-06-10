import React from 'react'

import { ValueWithLabelTitle, ValueWithLabelValue } from './ValueWithLabel.styles'

export const ValueWithLabel = ({
  title,
  value,
  big = false,
  center = false,
}: {
  title: string
  value: string
  big?: boolean
  center?: boolean
}) => (
  <div>
    <ValueWithLabelTitle mb="8px" fontSize="10px">
      {title}
    </ValueWithLabelTitle>
    <ValueWithLabelValue fontSize={big ? '18px' : '14px'} big={big} textAlign={center ? 'center' : 'left'}>
      {value}
    </ValueWithLabelValue>
  </div>
)
