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
import { BlurBox } from '../../ui/StyledElements/BlurBox'
import { PageWrapper } from '../../ui/StyledElements/PageWrapper'
import { getExplorerLink, shortenAddress } from '../../utils'
import {
  AvatarWrapper,
  Button,
  CallToActionWrapper,
  CustomLinkIcon,
  DetailActionWrapper,
  ENSAvatar,
  FullAccount,
  PaginationRow,
  StyledLink,
} from './Account.styles'
import { type Transaction } from './Account.types'
import { formattedTransactions as formatTransactions } from './accountUtils'
import CopyWrapper from './CopyWrapper'
import { NoDataTransactionRow, TransactionHeaders, TransactionRows } from './TransactionRows'

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
  const transactionsByPage = usePage<Transaction>(transactions, responsiveItemsPerPage, page, 0)

  useLayoutEffect(() => {
    // Resetting Eco Bridge transaction filtering in selectors
    dispatch(ecoBridgeUIActions.setBridgeTxsFilter(BridgeTxsFilter.NONE))
  })

  useEffect(() => {
    // format and merge transactions
    if (account) {
      setTransactions(formatTransactions(allTransactions, allBridgeTransactions, showPendingTransactions, account))
    }
  }, [allTransactions, allBridgeTransactions, showPendingTransactions, account])

  const handlePendingToggle = () => {
    setPage(1)
    togglePendingTransactions()
  }

  const handleAllNetworkTransactions = () => {
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
          {ENSName && ensAvatar?.image ? (
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
          <Switch label="PENDING TXNS" handleToggle={handlePendingToggle} isOn={showPendingTransactions} />
          <Switch label="ALL NETWORKS" handleToggle={handleAllNetworkTransactions} isOn={showAllNetworkTransactions} />
        </Flex>
      </Flex>
      <BlurBox>
        <TransactionHeaders />
        <TransactionRows transactions={transactionsByPage} showAllNetworkTransactions={showAllNetworkTransactions} />
        <NoDataTransactionRow data={transactions} />
      </BlurBox>
      <PaginationRow>
        <Box>
          <Pagination
            page={page}
            totalItems={transactions.length}
            itemsPerPage={responsiveItemsPerPage}
            onPageChange={setPage}
            hideOnSinglePage={transactions.length <= responsiveItemsPerPage}
          />
        </Box>
      </PaginationRow>
    </PageWrapper>
  )
}
