import React from 'react'
import { useTranslation } from 'react-i18next'

export const PoolListHeader = () => {
  const { t } = useTranslation()

  return (
    <div className="w-full grid grid-cols-12 px-7 py-4 border-b border-purple5 border-solid">
      <PoolListHeaderTitle colSpan={3}>{t('Pair')}</PoolListHeaderTitle>
      <PoolListHeaderTitle colSpan={3}>{t('Campaigns')}</PoolListHeaderTitle>
      <div className="col-span-6 flex justify-around">
        <PoolListHeaderTitle colSpan={2}>{t('TVL')}</PoolListHeaderTitle>
        <PoolListHeaderTitle colSpan={2}>{t('24hVolume')}</PoolListHeaderTitle>
        <PoolListHeaderTitle colSpan={1}>{t('APY')}</PoolListHeaderTitle>
      </div>
    </div>
  )
}

const PoolListHeaderTitle = ({ children, colSpan }) => {
  return <div className={`col-span-${colSpan} uppercase font-bold text-2xs text-purple3`}>{children}</div>
}
