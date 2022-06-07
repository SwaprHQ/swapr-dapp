import { Trash } from 'react-feather'
import styled from 'styled-components'

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`

export const Footer = styled.div`
  width: 100%;
  border-radius: 20px;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  border-top: 1px solid ${({ theme }) => theme.bg3};
  padding: 20px;
  text-align: center;
`

export const TrashIcon = styled(Trash)`
  cursor: pointer;
  width: 15px;
  height: 15px;
`
