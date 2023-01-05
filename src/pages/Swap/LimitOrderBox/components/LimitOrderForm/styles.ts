import styled from 'styled-components'

import { AutoRow as AutoRowBase } from '../../../../../components/Row'

export const AutoRow = styled(AutoRowBase)`
  gap: 12px;
  justify-items: space-between;
  flex-wrap: nowrap;
  > div {
    width: 50%;
  }
`

export const MaxAlert = styled.div`
  background-color: ${({ theme }) => theme.orange1};
  display: flex;
  font-size: 13px;
  padding: 10px;
  margin: 10px 0px;
  color: ${({ theme }) => theme.purpleBase};
  border-radius: 5px;
  justify-content: center;
`
