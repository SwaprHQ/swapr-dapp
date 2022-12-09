import Avatar from 'boring-avatars'
import { useEffect, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { useToggle } from 'react-use'
import { Box, Flex, Text } from 'rebass'

import { PageMetaData } from '../../components/PageMetaData'
import { Pagination } from '../../components/Pagination'
import { Switch } from '../../components/Switch'
import { useENSAvatar } from '../../hooks/useENSAvatar'
import { useIsMobileByMedia } from '../../hooks/useIsMobileByMedia'
import { usePage } from '../../hooks/usePage'
import { useResponsiveItemsPerPage } from '../../hooks/useResponsiveItemsPerPage'
import { useWeb3ReactCore } from '../../hooks/useWeb3ReactCore'
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
  const { t } = useTranslation('account')
  const dispatch = useDispatch()
  const isMobile = useIsMobileByMedia()

  // Account details
  const { account, chainId, ENSName, isActive, connector, tryDeactivation } = useWeb3ReactCore()
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

  const accountName = ENSName ? ENSName : account ? shortenAddress(`${account}`) : undefined

  return (
    <>
      <PageMetaData title={`${accountName ?? 'User account'} | Swapr`} />
      <PageWrapper>
        <Flex sx={{ mb: 4 }}>
          <Flex>
            {ENSName && ensAvatar?.image ? (
              <AvatarWrapper>
                <ENSAvatar url={ensAvatar.image} />
              </AvatarWrapper>
            ) : (
              <Avatar
                size={isMobile ? 80 : 120}
                name={account}
                variant="pixel"
                colors={['#5400AA', '#A602A2', '#5921CB', '#5F1A69', '#FF008B']}
              />
            )}
          </Flex>
          <Flex flexDirection="column" justifyContent="center" marginLeft={isMobile ? '16px' : '24px'}>
            <Box sx={{ mb: 1 }}>
              <Text as="h1" fontSize={[4, 5]} sx={{ color: '#C0BAF7', mb: 2, textTransform: 'uppercase' }}>
                {accountName ?? '--'}
              </Text>
              <FullAccount>{account}</FullAccount>
            </Box>
            <DetailActionWrapper>
              <CopyWrapper value={account} label={t('copyAddress')} />
              <StyledLink href={externalLink} rel="noopener noreferrer" target="_blank" disabled={!externalLink}>
                <CustomLinkIcon size={12} />
                <Box sx={{ ml: 1 }}>{t('viewOnExplorer')}</Box>
              </StyledLink>
            </DetailActionWrapper>
            <CallToActionWrapper>
              <Button onClick={toggleWalletSwitcherPopover}>{t('changeWallet')}</Button>
              {isActive && <Button onClick={() => tryDeactivation(connector, account)}>Disconnect</Button>}
            </CallToActionWrapper>
          </Flex>
        </Flex>
        <Flex sx={{ mb: 2 }} justifyContent="end">
          <Flex>
            <Switch
              label={t('pendingTransactions')}
              handleToggle={handlePendingToggle}
              isOn={showPendingTransactions}
            />
            <Switch
              label={t('allNetworks')}
              handleToggle={handleAllNetworkTransactions}
              isOn={showAllNetworkTransactions}
            />
          </Flex>
        </Flex>
        <BlurBox>
          <TransactionHeaders />
          <TransactionRows transactions={transactionsByPage} />
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
    </>
  )
}
