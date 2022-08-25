import { Box } from 'rebass'
import styled from 'styled-components'

import { gradients } from '../utils/theme'

export const BlurBox = styled(Box)`
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.purple5};

  background: ${gradients.purpleDimDark};
  background-blend-mode: normal, overlay, normal;
  backdrop-filter: blur(25px);
`
