import Avatar from 'boring-avatars'
import { useEffect, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { useToggle } from 'react-use'
import { Box, Flex, Text } from 'rebass'

import { Pagination } from '../../components/Pagination'
import { Switch } from '../../components/Switch'
import { useActiveWeb3React } from '../../hooks'
import { useENSAvatar } from '../../hooks/useENSAvatar'
import { useENSName } from '../../hooks/useENSName'
import { useIsMobileByMedia } from '../../hooks/useIsMobileByMedia'
import { usePage } from '../../hooks/usePage'
import { useResponsiveItemsPerPage } from '../../hooks/useResponsiveItemsPerPage'
import { BridgeTxsFilter } from '../../services/EcoBridge/EcoBridge.types'
import { ecoBridgeUIActions } from '../../services/EcoBridge/store/UI.reducer'
import { useWalletSwitcherPopoverToggle } from '../../state/application/hooks'
import { useAllBridgeTransactions, useAllSwapTransactions } from '../../state/transactions/hooks'
import { DimBlurBgBox } from '../../ui/DimBlurBgBox'
import { Header } from '../../ui/Header'
import { HeaderText } from '../../ui/HeaderText'
import { PageWrapper } from '../../ui/PageWrapper'
import { getExplorerLink, shortenAddress } from '../../utils'
import {
  AvatarWrapper,
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
import { type Transaction } from './Account.types'
import { formattedTransactions as formatTransactions } from './accountUtils'
import CopyWrapper from './CopyWrapper'
import { NoDataTransactionRow, TransactionRow } from './TransactionRow'
import { TransactionRowSmallLayout } from './TransactionRowSmallLayout'

export function Account() {
  const { t } = useTranslation('common')
  const dispatch = useDispatch()
  const isMobile = useIsMobileByMedia()

  // Account details
  const { account, chainId, active, deactivate } = useActiveWeb3React()
  const { ENSName } = useENSName(account ?? undefined)
  const { avatar: ensAvatar } = useENSAvatar(ENSName)

  // Toggles
  const [showAllNetworkTransactions, toggleAllTransactions] = useToggle(false)
  const [showPendingTransactions, togglePendingTransactions] = useToggle(false)
  const toggleWalletSwitcherPopover = useWalletSwitcherPopoverToggle()

  // Get all transactions
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const allTransactions = useAllSwapTransactions(showAllNetworkTransactions)
  const allBridgeTransactions = useAllBridgeTransactions(showAllNetworkTransactions)

  // Pagination
  const [page, setPage] = useState(1)
  const responsiveItemsPerPage = useResponsiveItemsPerPage()
  const transacationsByPage = usePage<Transaction>(transactions, responsiveItemsPerPage, page, 0)

  useLayoutEffect(() => {
    // Resetting Eco Bridge transaction filtering in selectors
    dispatch(ecoBridgeUIActions.setBridgeTxsFilter(BridgeTxsFilter.NONE))
  })

  useEffect(() => {
    // format and merge transactions
    setTransactions(formatTransactions(allTransactions, allBridgeTransactions, showPendingTransactions))
  }, [allTransactions, allBridgeTransactions, showPendingTransactions])

  const handlePendingToggle = () => {
    setPage(1)
    togglePendingTransactions()
  }

  const handleAllNetworkTransations = () => {
    setPage(1)
    toggleAllTransactions()
  }

  if (!account) {
    return <Navigate to="swap" replace />
  }

  const externalLink = chainId && account ? getExplorerLink(chainId, account, 'address') : undefined

  return (
    <PageWrapper>
      <Flex sx={{ mb: 4 }}>
        <Flex>
          {ENSName && ensAvatar?.image !== undefined ? (
            <AvatarWrapper>
              <ENSAvatar url={ensAvatar.image} />
            </AvatarWrapper>
          ) : (
            <Avatar
              size={isMobile ? 90 : 120}
              name={account}
              variant="pixel"
              colors={['#5400AA', '#A602A2', '#5921CB', '#5F1A69', '#FF008B']}
            />
          )}
        </Flex>
        <Flex flexDirection="column" justifyContent="center" marginLeft={isMobile ? '16px' : '24px'}>
          <Box sx={{ mb: 1 }}>
            <Text as="h1" fontSize={[4, 5]} sx={{ color: '#C0BAF7', mb: 2, textTransform: 'uppercase' }}>
              {ENSName ? ENSName : account ? shortenAddress(`${account}`) : '--'}
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
          <Switch label={'PENDING TXNS'} handleToggle={handlePendingToggle} isOn={showPendingTransactions} />
          <Switch label={'ALL NETWORKS'} handleToggle={handleAllNetworkTransations} isOn={showAllNetworkTransactions} />
        </Flex>
      </Flex>
      <DimBlurBgBox>
        <HeaderRow>
          <HeaderText>
            <Header justifyContent="space-between" paddingX="22px" paddingY="12px">
              <TranasctionDetails flex="15%" justifyContent="start">
                From
              </TranasctionDetails>
              <TranasctionDetails flex="15%" justifyContent="start">
                To
              </TranasctionDetails>
              <TranasctionDetails justifyContent="start">Price</TranasctionDetails>
              <TranasctionDetails>Type</TranasctionDetails>
              <TranasctionDetails>Status</TranasctionDetails>
              <TranasctionDetails>Time</TranasctionDetails>
            </Header>
          </HeaderText>
        </HeaderRow>
        {transacationsByPage?.map(transaction => {
          return isMobile ? (
            <TransactionRowSmallLayout
              transaction={transaction}
              key={transaction.hash}
              showAllNetworkTransactions={showAllNetworkTransactions}
            />
          ) : (
            <TransactionRow
              transaction={transaction}
              key={transaction.hash}
              showAllNetworkTransactions={showAllNetworkTransactions}
            />
          )
        })}
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
