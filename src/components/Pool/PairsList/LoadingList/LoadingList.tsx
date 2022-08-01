import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import { Flex } from 'rebass'

import { useResponsiveItemsPerPage } from '../../../../hooks/useResponsiveItemsPerPage'
import { Header } from '../../../../ui/Header'
import { HeaderText } from '../../../../ui/HeaderText'
import { ListLayout } from '../../../../ui/ListLayout'
import { LoadingRow } from './LoadingRow'

export function LoadingList() {
  const responsiveItemsPerPage = useResponsiveItemsPerPage()
  const { t } = useTranslation('pool')

  return (
    <ListLayout>
      {!isMobile && (
        <HeaderText>
          <Header justifyContent="space-between" paddingX="22px" paddingY="12px">
            <Flex flex="25%">{t('pairsList.pair')}</Flex>
            <Flex flex="25%">{t('campaigns')}</Flex>
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
