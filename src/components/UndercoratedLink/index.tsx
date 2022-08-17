import { ReactNode } from 'react'
import { Link, LinkProps, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  cursor: pointer;
`
interface UndecoratedLinkProps extends LinkProps {
  children: ReactNode
}

export const UndecoratedLink = ({ children, ...props }: UndecoratedLinkProps) => {
  const [search] = useSearchParams()
  switch (typeof props.to) {
    case 'string':
      return (
        <StyledLink {...props} to={{ pathname: props.to, search: search.toString() }}>
          {children}
        </StyledLink>
      )
    case 'object':
      return (
        <StyledLink {...props} to={{ ...props.to, search: search.toString() }}>
          {children}
        </StyledLink>
      )
    default:
      throw new Error('UndecoratedLink props to must be an object or string')
  }
}
