import { ReactNode } from 'react'
import { AlertCircle, CheckCircle } from 'react-feather'
import styled, { useTheme } from 'styled-components'

import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
  margin-right: 16px;
`

interface NotificationPopupProps {
  text: ReactNode
  status?: boolean
}

export function NotificationPopup({ text, status = true }: NotificationPopupProps) {
  const theme = useTheme()
  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        {status ? <CheckCircle color={theme.green1} size={24} /> : <AlertCircle color={theme.red1} size={24} />}
      </div>
      <AutoColumn gap="8px">
        <TYPE.Body fontWeight={500}>{text}</TYPE.Body>
      </AutoColumn>
    </RowNoFlex>
  )
}
