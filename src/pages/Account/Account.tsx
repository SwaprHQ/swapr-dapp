import Avatar from 'boring-avatars'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { useToggle } from 'react-use'
import { Box, Flex, Text } from 'rebass'

import EnsFallbackAvatar from '../../assets/images/Test_Ellipss.png'
import { Pagination } from '../../components/Pagination'
import { Switch } from '../../components/Switch'
import { useActiveWeb3React } from '../../hooks'
import { useENSAvatar } from '../../hooks/useENSAvatar'
import useENSName from '../../hooks/useENSName'
import { useIsMobileByMedia } from '../../hooks/useIsMobileByMedia'
import { usePage } from '../../hooks/usePage'
import { useResponsiveItemsPerPage } from '../../hooks/useResponsiveItemsPerPage'
import { useWalletSwitcherPopoverToggle } from '../../state/application/hooks'
import { useAllTransactions } from '../../state/transactions/hooks'
import { DimBlurBgBox } from '../../ui/DimBlurBgBox'
import { Header } from '../../ui/Header'
import { HeaderText } from '../../ui/HeaderText'
import { PageWrapper } from '../../ui/PageWrapper'
import { getExplorerLink, shortenAddress } from '../../utils'
import {
  Button,
  CallToActionWrapper,
  CustomLinkIcon,
  DetailActionWrapper,
  ENSAvatar,
  FullAccount,
  HeaderRow,
  PaginationRow,
  StyledLink,
  TranasctionDetails,
} from './Account.styles'
import { formattedTransactions, type Transaction } from './accountUtils'
import CopyWrapper from './CopyWrapper'
import { NoDataTransactionRow, TransactionRow } from './TransactionRow'

export function Account() {
  const { t } = useTranslation('common')
  const { account, chainId, active, deactivate } = useActiveWeb3React()
  const toggleWalletSwitcherPopover = useWalletSwitcherPopoverToggle()
  const { ENSName } = useENSName(account ?? undefined)
  const { avatar: ensAvatar } = useENSAvatar(ENSName)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const [page, setPage] = useState(1)
  const responsiveItemsPerPage = useResponsiveItemsPerPage()
  const [showAllNetworkTransactions, toggleAllTransactions] = useToggle(false)
  const allTransactions = useAllTransactions(showAllNetworkTransactions)
  const transacationsByPage = usePage(transactions, responsiveItemsPerPage, page, 0)

  const isMobile = useIsMobileByMedia()
  const avatharSize = isMobile ? 75 : 100

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
        <Flex>
          {ENSName && ensAvatar ? (
            <ENSAvatar size={avatharSize} url={ensAvatar.image ?? EnsFallbackAvatar} />
          ) : (
            <Avatar
              size={avatharSize}
              name={account}
              variant="pixel"
              colors={['#5400AA', '#A602A2', '#5921CB', '#5F1A69', '#FF008B']}
            />
          )}
        </Flex>
        <Flex flexDirection="column" justifyContent="center" marginLeft="5%">
          <Box sx={{ mb: 1 }}>
            <Text as="h1" fontSize={[4, 5]} sx={{ color: '#C0BAF7', mb: 2 }}>
              {ENSName ?? account ? shortenAddress(`${account}`) : '--'}
            </Text>
            <FullAccount>{account}</FullAccount>
          </Box>
          <DetailActionWrapper>
            <CopyWrapper value={account} label="COPY ADDRESS" />
            <StyledLink href={externalLink} rel="noopener noreferrer" target="_blank" disabled={!externalLink}>
              <CustomLinkIcon size={12} />
              <Box sx={{ ml: 1 }}>{t('viewOnBlockExplorer')}</Box>
            </StyledLink>
          </DetailActionWrapper>
          <CallToActionWrapper>
            <Button onClick={toggleWalletSwitcherPopover}>Change Wallet</Button>
            {active && <Button onClick={deactivate}>Disconnect</Button>}
          </CallToActionWrapper>
        </Flex>
      </Flex>
      <Flex sx={{ mb: 2 }} justifyContent="end">
        <Flex>
          <Switch label={'ALL NETWORKS'} handleToggle={toggleAllTransactions} isOn={showAllNetworkTransactions} />
        </Flex>
      </Flex>
      <DimBlurBgBox>
        <HeaderRow>
          <HeaderText>
            <Header justifyContent="space-between" paddingX="22px" paddingY="12px">
              <TranasctionDetails flex="6%">Network</TranasctionDetails>
              <TranasctionDetails flex="15%" justifyContent="start">
                From
              </TranasctionDetails>
              <TranasctionDetails flex="15%" justifyContent="start">
                To
              </TranasctionDetails>
              <TranasctionDetails>Type</TranasctionDetails>
              <TranasctionDetails justifyContent="start">Price</TranasctionDetails>
              <TranasctionDetails>Status</TranasctionDetails>
              <TranasctionDetails>Time</TranasctionDetails>
            </Header>
          </HeaderText>
        </HeaderRow>
        {transacationsByPage?.map(transaction => (
          <TransactionRow transaction={transaction} key={transaction.hash} />
        ))}
        {transactions?.length === 0 && <NoDataTransactionRow />}
      </DimBlurBgBox>
      <PaginationRow>
        <Box>
          <Pagination
            page={page}
            totalItems={transactions.length + 1}
            itemsPerPage={responsiveItemsPerPage}
            onPageChange={setPage}
          />
        </Box>
      </PaginationRow>
    </PageWrapper>
  )
}
