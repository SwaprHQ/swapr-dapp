import React from 'react'
import styled from 'styled-components'
import { NavLink, NavLinkProps } from 'react-router-dom'
import transparentize from 'polished/lib/color/transparentize'

import { ExternalLink } from '../../theme/components'

const StyledNavLink = styled(NavLink)`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text5};
  width: fit-content;
  font-weight: 400;
  font-size: 14px;
  line-height: 19.5px;
  font-family: 'Montserrat';
  position: relative;

  &.active {
    font-weight: 600;
    color: ${({ theme }) => theme.white};
  }
`

const StyledExternalLink = styled(ExternalLink)`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  outline: none;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  text-decoration: none;
  color: ${({ theme, disabled }) => (disabled ? transparentize(0.6, theme.text5) : theme.text5)};
  font-weight: 400;
  font-size: 14px;
  line-height: 19.5px;
  width: fit-content;
  text-decoration: none !important;
  font-family: 'Montserrat';
  position: relative;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const StyledMobileLink = styled(NavLink)`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    font-weight:400;
    font-size: 14px;
    color:#C9C7DB;
    &.active {
      font-weight: 600;
      color: ${({ theme }) => theme.white};
    }
  `};
`

const StyledExternalMobileLink = styled(ExternalLink)`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    font-weight:600;
    font-size: 14px;
    color:#C9C7DB;
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
   `};
`

export interface HeaderLinkProps extends Omit<NavLinkProps, 'to'> {
  id: string
  to?: string
  href?: string
  disabled?: boolean
}

export const HeaderLink = ({ id, to = '', href, disabled, children, ...navLinkProps }: HeaderLinkProps) => {
  if (href || disabled) {
    return (
      <StyledExternalLink id={id} href={disabled ? '/#' : href ?? '/#'} disabled={disabled}>
        {children}
      </StyledExternalLink>
    )
  }

  if (to) {
    return (
      <StyledNavLink to={to} {...navLinkProps}>
        {children}
      </StyledNavLink>
    )
  }

  return null
}

export const HeaderMobileLink = ({ id, to = '', href, disabled, children, ...navLinkProps }: HeaderLinkProps) => {
  if (href || disabled) {
    return (
      <StyledExternalMobileLink id={id} href={disabled ? '/#' : href ?? '/#'} disabled={disabled}>
        {children}
      </StyledExternalMobileLink>
    )
  }

  if (to !== undefined && to !== '') {
    return (
      <StyledMobileLink to={to} {...navLinkProps}>
        {children}
      </StyledMobileLink>
    )
  }

  throw new Error('Either to or href props must be provided')
}
