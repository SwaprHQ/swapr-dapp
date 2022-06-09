import React, { FC } from 'react'
import { useTheme } from 'styled-components'
import { Text } from 'rebass'
import { useIsMobileByMedia } from '../../../../hooks/useIsMobileByMedia'

import { ValueWithLabel } from '../../PairView/ValueWithLabel/ValueWithLabel.component'

export const ResponsiveValueWithLabel: FC<{
  title: string
  value: string
  color?: string
  big?: boolean
  fontSize?: string
}> = ({ title, value, color, big, fontSize }) => {
  const isMobile = useIsMobileByMedia()
  const theme = useTheme()

  return isMobile ? (
    <ValueWithLabel title={title} big={big} value={value} />
  ) : (
    <Text fontWeight="500" fontSize={fontSize || '14px'} color={color || theme.purple2}>
      {value}
    </Text>
  )
}
