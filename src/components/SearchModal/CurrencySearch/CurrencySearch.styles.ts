import styled from 'styled-components'
import Column from '../../Column'
import { CloseIcon } from '../../../theme'

export const ContentWrapper = styled(Column)`
  width: 100%;
  border-radius: 12px;
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: ${({ theme }) => theme.dark2};
`

export const Footer = styled.div`
  width: 100%;
  border-radius: 8px;
  padding: 16px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background-color: ${({ theme }) => theme.bg1And2};
  border-top: 1px solid ${({ theme }) => theme.bg1And2};
`
export const CloseIconStyled = styled(CloseIcon)`
  display: flex;
  padding: 0;
`
