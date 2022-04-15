import { Token } from '@swapr/sdk'
import { CSSProperties } from 'react'

export interface ImportRowProps {
  token: Token
  style?: CSSProperties
  dim?: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
}
