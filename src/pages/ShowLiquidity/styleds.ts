import styled from 'styled-components'
import { RowBetween } from '../../components/Row'
import { ButtonPrimary, ButtonSecondary } from '../../components/Button'

export const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
`};
`

export const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`

export const GradientButton = styled(ButtonSecondary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
  background: linear-gradient(141.72deg, rgba(255, 255, 255, 0.55) -11.46%, rgba(0, 0, 0, 0) 155.17%),
    ${({ theme }) => theme.dark1};
  background-blend-mode: overlay;
  border: 1px solid #28263f;
`
