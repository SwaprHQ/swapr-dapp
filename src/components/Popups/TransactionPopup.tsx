import React from 'react'
import { AlertCircle, CheckCircle } from 'react-feather'
import styled, { useTheme } from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { SwapProtocol } from '../../state/transactions/reducer'
import { TYPE } from '../../theme'
import { ExternalLink } from '../../theme/components'
import { getExplorerLink, getGnosisProtocolExplorerOrderLink } from '../../utils'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'
//import { ChainId } from '@swapr/sdk'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
  margin-right: 16px;
`

export default function TransactionPopup({
  hash,
  success,
  summary,
  swapProtocol,
}: {
  hash: string
  success?: boolean
  summary?: string
  swapProtocol?: SwapProtocol
}) {
  const { chainId } = useActiveWeb3React()

  const theme = useTheme()

  const isGnosisProtocolHash = swapProtocol === SwapProtocol.COW

  const explorer = 'View on ' + (isGnosisProtocolHash ? 'Gnosis Protocol Explorer' : 'block explorer')

  const body = chainId && (
    <ExternalLink
      href={
        isGnosisProtocolHash
          ? getGnosisProtocolExplorerOrderLink(chainId, hash)
          : getExplorerLink(chainId, hash, 'transaction')
      }
    >
      {explorer}
    </ExternalLink>
  )

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        {success ? <CheckCircle color={theme.green1} size={24} /> : <AlertCircle color={theme.red1} size={24} />}
      </div>
      <AutoColumn gap="8px">
        <TYPE.body fontWeight={500}>{summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}</TYPE.body>
        {body}
      </AutoColumn>
    </RowNoFlex>
  )
}
