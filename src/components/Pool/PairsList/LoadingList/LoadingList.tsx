import React from 'react'
import { isMobile } from 'react-device-detect'

import { useResponsiveItemsPerPage } from '../../../../hooks/useResponsiveItemsPerPage'
import { PoolListHeader } from '../PoolListHeader'
import { LoadingRow } from './LoadingRow'

export function LoadingList() {
  const responsiveItemsPerPage = useResponsiveItemsPerPage()

  return (
    <div className="grid grid-cols-auto py-3 px-4 md:p-0">
      {!isMobile && <PoolListHeader />}
      {new Array(responsiveItemsPerPage).fill(null).map((_, index) => (
        <LoadingRow key={index} />
      ))}
    </div>
  )
}
