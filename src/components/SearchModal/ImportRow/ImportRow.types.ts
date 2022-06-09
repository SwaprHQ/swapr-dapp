import { Token } from '@swapr/sdk'
import { CSSProperties } from 'react'

export interface ImportRowProps {
  dim?: boolean
  token: Token
  style?: CSSProperties
  showImportView: () => void
  setImportToken: (token: Token) => void
}
