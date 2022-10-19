import { useTranslation } from 'react-i18next'
import { Flex } from 'rebass'

import { TableHeader } from '../../../ui/StyledElements/TableHeader'
import { TableHeaderText } from '../../../ui/StyledElements/TableHeaderText'
import { HeaderRow, TransactionDetails } from '../Account.styles'

export function TransactionHeaders() {
  const { t } = useTranslation('account')
  return (
    <HeaderRow>
      <TableHeaderText>
        <TableHeader justifyContent="space-between" paddingX="22px" paddingY="12px">
          <TransactionDetails flex="15%" justifyContent="start">
            {t('from')}
          </TransactionDetails>
          <TransactionDetails flex="15%" justifyContent="start">
            {t('to')}
          </TransactionDetails>
          <TransactionDetails justifyContent="start">{t('price')}</TransactionDetails>
          <TransactionDetails>{t('type')}</TransactionDetails>
          <TransactionDetails>{t('status')}</TransactionDetails>
          <TransactionDetails>{t('confirmedTime')}</TransactionDetails>
          <Flex width="20px">{t('cta')}</Flex>
        </TableHeader>
      </TableHeaderText>
    </HeaderRow>
  )
}
