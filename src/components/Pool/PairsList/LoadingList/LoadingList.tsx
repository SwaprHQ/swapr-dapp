import React from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import { Flex } from 'rebass'

import { useResponsiveItemsPerPage } from '../../../../hooks/useResponsiveItemsPerPage'
import { Header, HeaderText, ListLayout } from '../PairsList'
import { LoadingRow } from './LoadingRow'

export function LoadingList() {
  const responsiveItemsPerPage = useResponsiveItemsPerPage()
  const { t } = useTranslation()

  return (
    <ListLayout>
      {!isMobile && (
        <HeaderText>
          <Header justifyContent="space-between" paddingX="22px" paddingY="12px">
            <Flex flex="25%">{t('Pair')}</Flex>
            <Flex flex="25%">{t('Campaigns')}</Flex>
            <Flex flex="45%">
              <Flex flex="30%">{t('TVL')}</Flex>
              <Flex flex="30%">{t('24hVolume')}</Flex>
              <Flex flex="10%">{t('APY')}</Flex>
            </Flex>
          </Header>
        </HeaderText>
      )}
      {new Array(responsiveItemsPerPage).fill(null).map((_, index) => (
        <LoadingRow key={index} />
      ))}
    </ListLayout>
  )
}
