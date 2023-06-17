import styled from 'styled-components'

import { AutoRow as AutoRowBase } from '../../../../components/Row'

export const AutoRow = styled(AutoRowBase)`
  gap: 12px;
  justify-items: space-between;
  flex-wrap: nowrap;
  > div {
    width: 50%;
  }
`
