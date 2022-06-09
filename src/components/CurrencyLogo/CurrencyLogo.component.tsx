import React, { ReactNode } from 'react'
import Skeleton from 'react-loading-skeleton'
import { StyledLogo, Wrapper } from './CurrencyLogo.styles'
import { CurrencyLogoComponentProps } from './CurrencyLogo.types'

export const CurrencyLogoComponent = ({
  size = '24px',
  style,
  loading,
  sources,
  currency,
  className,
  marginRight = 0,
  marginLeft = 0,
}: CurrencyLogoComponentProps) => {
  if (loading)
    return (
      <Skeleton
        wrapper={({ children }: { children: ReactNode }) => (
          <Wrapper
            size={size}
            className={className}
            isLoading={loading}
            marginLeft={marginLeft}
            marginRight={marginRight}
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
        alt={`${currency?.symbol ?? 'token'} logo`}
        size={size}
        style={style}
        sources={sources}
        defaultText={currency?.symbol || '?'}
      />
    </Wrapper>
  )
}
