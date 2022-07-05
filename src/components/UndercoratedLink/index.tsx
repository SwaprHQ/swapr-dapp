import React, { ReactNode } from 'react'
import { Link, LinkProps, useSearchParams } from 'react-router-dom'

interface UndecoratedLinkProps extends LinkProps {
  children: ReactNode
  className?: string
}

export const UndecoratedLink = ({ children, className, ...props }: UndecoratedLinkProps) => {
  const [search] = useSearchParams()
  switch (typeof props.to) {
    case 'string':
      return (
        <Link
          {...props}
          to={{ pathname: props.to, search: search.toString() }}
          className={`text-inherit no-underline	cursor-pointer ${className}`}
        >
          {children}
        </Link>
      )
    case 'object':
      return (
        <Link
          {...props}
          to={{ ...props.to, search: search.toString() }}
          className={`text-inherit no-underline	cursor-pointer ${className}`}
        >
          {children}
        </Link>
      )
    default:
      throw new Error('UndecoratedLink props to must be an object or string')
  }
}
