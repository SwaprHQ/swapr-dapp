import React from 'react'
import { useResponsiveItemsPerPage } from '../../../hooks/useResponsiveItemsPerPage'
import { LoadingCard } from './LoadingCard'
import { ListLayout, Header, HeaderText } from '../PairsList/PairsList.styles'
import { LoadingListProps } from './LoadingList.types'
import { useTranslation } from 'react-i18next'

export function LoadingList({ itemsAmount }: LoadingListProps) {
  const responsiveItemsAmount = useResponsiveItemsPerPage()
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
      {new Array(itemsAmount && itemsAmount !== 0 ? itemsAmount : responsiveItemsAmount).fill(null).map((_, index) => (
        <LoadingCard key={index} />
      ))}
    </ListLayout>
  )
}
