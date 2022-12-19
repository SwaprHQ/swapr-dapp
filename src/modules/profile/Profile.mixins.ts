import { css } from 'styled-components'

export interface ProfileAccentMixinProps {
  gradientColors: string[]
  backgroundColor: string
}

export const profileAccentBorderMixin = ({ gradientColors, backgroundColor }: ProfileAccentMixinProps) => css`
  background: linear-gradient(${backgroundColor}, ${backgroundColor}) padding-box,
    linear-gradient(to bottom, ${gradientColors.join(',')}) border-box;
`
