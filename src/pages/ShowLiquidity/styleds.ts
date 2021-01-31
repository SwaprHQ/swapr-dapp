import styled from 'styled-components'

import { RowBetween } from '../../components/Row'
import { LightCard } from '../../components/Card'
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

export const ContentCard = styled(LightCard)`
  background: linear-gradient(113.18deg, rgba(255, 255, 255, 0.35) -0.1%, rgba(0, 0, 0, 0) 98.9%),
    ${({ theme }) => theme.dark1};
  background-blend-mode: overlay, normal;
  border-radius: 8px;
  padding: 25px 20px;
  position: relative;
  border: none;
  ::before {
    content: '';
    background-image: linear-gradient(180deg, #14131d 0%, rgb(68 65 99 / 50%) 100%);
    top: -1px;
    left: -1px;
    bottom: -1px;
    right: -1px;
    position: absolute;
    z-index: -1;
    border-radius: 8px;
  }
`
