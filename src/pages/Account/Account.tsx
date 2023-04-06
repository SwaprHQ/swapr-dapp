import { Select } from '@rebass/forms'
import Avatar from 'boring-avatars'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useToggle } from 'react-use'
import { Box, Flex, Text } from 'rebass'

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
import CopyWrapper from './CopyWrapper'
import { NoDataTransactionRow, TransactionHeaders, TransactionRows } from './TransactionRows'
import { formatTransactions, TransactionFilter } from './utils/accountUtils'
import { PageMetaData } from '../../components/PageMetaData'
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
import { useLimitOrderTransactions } from '../Swap/LimitOrderBox/utils/hooks'

export function Account() {
  const { t } = useTranslation('account')
  const dispatch = useDispatch()
  const isMobile = useIsMobileByMedia()
  const [searchParams, setSearchParams] = useSearchParams()

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
  const allLimitOrderTransactions = useLimitOrderTransactions(chainId, account, showAllNetworkTransactions)

  // Pagination
  const [page, setPage] = useState(1)
  const responsiveItemsPerPage = useResponsiveItemsPerPage()
  const transactionsByPage = usePage<Transaction>(transactions, responsiveItemsPerPage, page, 0)

  useEffect(() => {
    // Resetting Eco Bridge transaction filtering in selectors
    dispatch(ecoBridgeUIActions.setBridgeTxsFilter(BridgeTxsFilter.NONE))
    // Set default filter to ALL on initial load if no filter is present
    if (!searchParams.get('filter')) {
      searchParams.set('filter', TransactionFilter.ALL)
      setSearchParams(searchParams, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // format and merge transactions
    if (account) {
      setTransactions(
        formatTransactions(
          allTransactions,
          allBridgeTransactions,
          allLimitOrderTransactions,
          showPendingTransactions,
          account,
          searchParams.get('filter') as TransactionFilter
        )
      )
    }
  }, [
    allTransactions,
    allBridgeTransactions,
    showPendingTransactions,
    account,
    allLimitOrderTransactions,
    searchParams,
  ])

  const handlePendingToggle = () => {
    setPage(1)
    togglePendingTransactions()
  }

  const handleAllNetworkTransactions = () => {
    setPage(1)
    toggleAllTransactions()
  }

  const handleTransactionFilter = useCallback(({ target: { name, value } }: ChangeEvent<HTMLSelectElement>) => {
    setPage(1)
    searchParams.set(name, value)
    setSearchParams(searchParams, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
              {active && <Button onClick={deactivate}>{t('disconnect')}</Button>}
            </CallToActionWrapper>
          </Flex>
        </Flex>
        <Flex justifyContent="space-between" flexWrap="wrap">
          <Flex sx={{ mb: 2 }}>
            <Select
              name="filter"
              sx={{
                borderRadius: '8px',
                border: 'solid 1px #3E4259',
                minWidth: '140px',
                fontSize: '13px',
                textTransform: 'uppercase',
                color: '#c0baf5',
              }}
              onChange={handleTransactionFilter}
            >
              <option value={TransactionFilter.ALL}>All</option>
              <option value={TransactionFilter.SWAP}>Swap Orders</option>
              <option value={TransactionFilter.BRIDGE}>Bridge Orders</option>
              <option value={TransactionFilter.LIMIT}>Limit Orders</option>
            </Select>
          </Flex>
          <Flex sx={{ mb: 2, alignItems: 'center' }}>
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
