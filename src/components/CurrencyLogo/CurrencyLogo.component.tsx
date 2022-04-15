import React, { ReactNode } from 'react'
import Skeleton from 'react-loading-skeleton'
import { StyledLogo, Wrapper } from './CurrencyLogo.styles'
import { CurrencyLogoComponentProps } from './CurrencyLogo.types'

export const CurrencyLogoComponent = ({
  currency,
  size = '24px',
  style,
  className,
  loading,
  marginRight = 0,
  marginLeft = 0,
  sources
}: CurrencyLogoComponentProps) => {
  if (loading)
    return (
      <Skeleton
        wrapper={({ children }: { children: ReactNode }) => (
          <Wrapper
            looading={loading}
            size={size}
            marginRight={marginRight}
            marginLeft={marginLeft}
            className={className}
          >
            {children}
          </Wrapper>
        )}
        circle
        width={size}
        height={size}
      />
    )

  return (
    <Wrapper size={size} marginRight={marginRight} marginLeft={marginLeft} className={className}>
      <StyledLogo
        size={size}
        defaultText={currency?.symbol || '?'}
        srcs={sources}
        alt={`${currency?.symbol ?? 'token'} logo`}
        style={style}
      />
    </Wrapper>
  )
}
