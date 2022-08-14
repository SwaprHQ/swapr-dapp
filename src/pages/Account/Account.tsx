import Avatar from 'boring-avatars'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { Box, Flex, Heading, Text } from 'rebass'

import { Switch } from '../../components/Switch'
import { useActiveWeb3React } from '../../hooks'
import useENSName from '../../hooks/useENSName'
import { useAllTransactions } from '../../state/transactions/hooks'
import { DimBlurBgBox } from '../../ui/DimBlurBgBox'
import { Header } from '../../ui/Header'
import { HeaderText } from '../../ui/HeaderText'
import { ListLayout } from '../../ui/ListLayout'
import { PageWrapper } from '../../ui/PageWrapper'
import { getExplorerLink, shortenAddress } from '../../utils'
import { CustomLinkIcon, StyledLink, TokenDetails, TokenRow } from './Account.styles'
import { formattedTransactions, type Transaction } from './accountUtils'
import CopyWrapper from './CopyWrapper'
import { TransactionRow } from './TransactionRow'

export function Account() {
  const { t } = useTranslation('common')
  const [allNetworkTransactions, setAllNetworkTransactions] = useState<boolean>(false)
  const allTransactions = useAllTransactions(allNetworkTransactions)
  const { account, chainId } = useActiveWeb3React()
  const { ENSName } = useENSName(account ?? undefined)

  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    setTransactions(formattedTransactions(allTransactions))
  }, [allTransactions])

  if (!account) {
    return <Navigate to="swap" replace />
  }

  const externalLink = chainId && account ? getExplorerLink(chainId, account, 'address') : undefined

  return (
    <PageWrapper>
      <Flex sx={{ mb: 4 }}>
        <Flex width={'150px'}>
          <Avatar
            size={100}
            name={`${account}`}
            variant="pixel"
            colors={['#5400AA', '#A602A2', '#5921CB', '#5F1A69', '#FF008B']}
          />
        </Flex>
        <Flex flex="15%" flexDirection="column" justifyContent="center">
          <Box sx={{ mb: 1 }}>
            <Heading as="h1" fontSize={[3, 4, 5]} color="primary">
              {ENSName ?? account ? shortenAddress(`${account}`) : '--'}
            </Heading>
            <Text as="p" sx={{ fontSize: '10px', mt: 1, letterSpacing: '1px' }}>
              {account}
            </Text>
          </Box>
          <Box sx={{ display: 'flex', mt: 2, textTransform: 'uppercase', fontSize: '8px' }}>
            <CopyWrapper value={account} label="COPY ADDRESS" />
            <StyledLink href={externalLink} rel="noopener noreferrer" target="_blank" disabled={!externalLink}>
              <CustomLinkIcon size={12} />
              <Box sx={{ ml: 1 }}>{t('viewOnBlockExplorer')}</Box>
            </StyledLink>
          </Box>
        </Flex>
      </Flex>
      <Flex sx={{ mb: 2 }} justifyContent="end">
        <Flex>
          <Switch
            label={'ALL NETWORKS'}
            handleToggle={() => {
              setAllNetworkTransactions(txn => !txn)
            }}
            isOn={allNetworkTransactions}
          />
        </Flex>
      </Flex>
      <DimBlurBgBox>
        <ListLayout>
          <HeaderText>
            <Header justifyContent="space-between" paddingX="22px" paddingY="12px">
              {allNetworkTransactions && <Flex flex="5%">NTWK</Flex>}
              <Flex flex="8%">Type</Flex>
              <TokenRow>From</TokenRow>
              <TokenRow>To</TokenRow>
              <Flex flex="15%" justifyContent="right" sx={{ pr: 2 }}>
                Price
              </Flex>
              <TokenDetails>Status</TokenDetails>
              <TokenDetails>Time</TokenDetails>
              <TokenDetails>Details</TokenDetails>
            </Header>
          </HeaderText>
        </ListLayout>
        {transactions?.map(transaction => (
          <TransactionRow
            allNetworkTransactions={allNetworkTransactions}
            transaction={transaction}
            key={transaction.hash}
          />
        ))}
      </DimBlurBgBox>
    </PageWrapper>
  )
}
