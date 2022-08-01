import { useTranslation } from 'react-i18next'
import { Flex } from 'rebass'

import { DimBlurBgBox } from '../../ui/DimBlurBgBox'
import { Header } from '../../ui/Header'
import { HeaderText } from '../../ui/HeaderText'
import { ListLayout } from '../../ui/ListLayout'
import { PageWrapper } from '../../ui/PageWrapper'

export function Account() {
  const { t } = useTranslation('pool')

  return (
    <PageWrapper>
      <DimBlurBgBox>
        <ListLayout>
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
        </ListLayout>
      </DimBlurBgBox>
    </PageWrapper>
  )
}
