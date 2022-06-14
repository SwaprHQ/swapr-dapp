import { ChainId } from '@swapr/sdk'

import React from 'react'
import { AlertCircle, CheckCircle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { useActiveWeb3React } from '../../hooks'
import { PopupContent } from '../../state/application/actions'
import { SwapProtocol } from '../../state/transactions/reducer'
import { TYPE } from '../../theme'
import { ExternalLink } from '../../theme/components'
import { getExplorerLink, getGnosisProtocolExplorerOrderLink } from '../../utils'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
  margin-right: 16px;
`

export function TransactionPopup({ hash, success, summary, swapProtocol }: PopupContent) {
  const { chainId } = useActiveWeb3React()

  const { t } = useTranslation()
  const theme = useTheme()

  const isGnosisProtocolHash = swapProtocol === SwapProtocol.COW

  const explorer = isGnosisProtocolHash ? t('gnosisProtocolExplorer') : t('blockExplorer')

  const link = isGnosisProtocolHash
    ? getGnosisProtocolExplorerOrderLink(chainId as ChainId, hash)
    : getExplorerLink(chainId as ChainId, hash, 'transaction')

  const popupText = `${t('viewOn')} ${explorer}`

  const explorerExternalLink = <ExternalLink href={link}>{popupText}</ExternalLink>

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        {success ? <CheckCircle color={theme.green1} size={24} /> : <AlertCircle color={theme.red1} size={24} />}
      </div>
      <AutoColumn gap="8px">
        <TYPE.body fontWeight={500}>{summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}</TYPE.body>
        {explorerExternalLink}
      </AutoColumn>
    </RowNoFlex>
  )
}
