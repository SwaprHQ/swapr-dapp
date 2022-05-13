import React from 'react'
import { LoadingRow } from './LoadingRow'
import { ListLayout, Header, HeaderText } from '../PairsList/PairsList.styles'
import { useTranslation } from 'react-i18next'
import { useResponsiveItemsPerPage } from '../../../hooks/useResponsiveItemsPerPage'

export function LoadingList() {
  const responsiveItemsPerPage = useResponsiveItemsPerPage()
  const { t } = useTranslation()

  return (
    <ListLayout>
      <Header>
        <HeaderText>{t('Pair')}</HeaderText>
        <HeaderText>{t('Campaigns')}</HeaderText>
        <HeaderText>{t('TVL')}</HeaderText>
        <HeaderText>{t('24hVolume')}</HeaderText>
        <HeaderText>{t('APY')}</HeaderText>
      </Header>
      {new Array(responsiveItemsPerPage).fill(null).map((_, index) => (
        <LoadingRow key={index} />
      ))}
    </ListLayout>
  )
}
