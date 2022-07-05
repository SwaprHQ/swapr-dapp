import classNames from 'classnames'
import React from 'react'

import { useIsMobileByMedia } from '../../../../hooks/useIsMobileByMedia'

export const ValueWithLabel = ({
  title,
  value,
  big = false,
  center = false,
  labelDesktop = true,
}: {
  title: string
  value: string
  big?: boolean
  center?: boolean
  labelDesktop?: boolean
}) => {
  const isMobile = useIsMobileByMedia()

  return (
    <div>
      {(labelDesktop || isMobile) && <p className="mb-3 text-xs text-text5 uppercase">{title}</p>}
      <p
        className={classNames({
          'text-sm md:text-lg text-white': big,
          ' text-xs md:text-sm text-text4': !big,
          center: center,
          left: !center,
        })}
      >
        {value}
      </p>
    </div>
  )
}
