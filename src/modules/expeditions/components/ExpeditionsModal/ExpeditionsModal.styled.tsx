import styled from 'styled-components'

import { AutoColumn } from '../../../../components/Column'
import { HeaderButton } from '../../../../components/Header/HeaderButton'
import { expeditionsColorMixin, glowMixin } from '../shared'

export const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  background-color: ${({ theme }) => theme.dark1};
  padding: 32px;
  overflow-y: hidden;
`

export const ExpeditionsLogo = styled(HeaderButton)`
  ${expeditionsColorMixin}
  ${glowMixin}
`
