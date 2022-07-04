import classNames from 'classnames'
import React, { ReactNode } from 'react'

interface EmptyProps {
  padding?: string
  children: ReactNode
}

export const DimBlurBgBox = ({ children, padding }: EmptyProps) => {
  return (
    <div
      className={classNames(
        'border border-solid border-purple5 rounded-xl backdrop-blur bg-blend-overlay bg-purple-dim-dark',
        {
          'p-6': padding,
        }
      )}
    >
      {children}
    </div>
  )
}
