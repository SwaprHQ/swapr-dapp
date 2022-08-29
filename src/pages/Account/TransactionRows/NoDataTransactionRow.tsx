import { Flex, Text } from 'rebass'

import { GridCard } from '../Account.styles'

export function NoDataTransactionRow({ data }: { data: unknown[] }) {
  if (data.length === 0) {
    return (
      <GridCard>
        <Flex flex={1}>
          <Text sx={{ textAlign: 'center', width: '100%' }}>No transactions to show</Text>
        </Flex>
      </GridCard>
    )
  }

  return null
}
