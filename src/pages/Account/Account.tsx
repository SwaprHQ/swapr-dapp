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
  const avatharSize = isMobile ? 90 : 120

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
            <AvatarWrapper>
              <ENSAvatar url={ensAvatar.image ?? EnsFallbackAvatar} />
            </AvatarWrapper>
          ) : (
            <Avatar
              size={avatharSize}
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
      <svg height="0" viewBox="0 0 200 188" width="0">
        <defs>
          <clipPath clipPathUnits="objectBoundingBox" id="bruh" transform="scale(0.005 0.005319148936170213)">
            <path d="M193.248 69.51C185.95 54.1634 177.44 39.4234 167.798 25.43L164.688 20.96C160.859 15.4049 155.841 10.7724 149.998 7.3994C144.155 4.02636 137.633 1.99743 130.908 1.46004L125.448 1.02004C108.508 -0.340012 91.4873 -0.340012 74.5479 1.02004L69.0879 1.46004C62.3625 1.99743 55.8413 4.02636 49.9981 7.3994C44.155 10.7724 39.1367 15.4049 35.3079 20.96L32.1979 25.47C22.5561 39.4634 14.0458 54.2034 6.74789 69.55L4.39789 74.49C1.50233 80.5829 0 87.2441 0 93.99C0 100.736 1.50233 107.397 4.39789 113.49L6.74789 118.43C14.0458 133.777 22.5561 148.517 32.1979 162.51L35.3079 167.02C39.1367 172.575 44.155 177.208 49.9981 180.581C55.8413 183.954 62.3625 185.983 69.0879 186.52L74.5479 186.96C91.4873 188.32 108.508 188.32 125.448 186.96L130.908 186.52C137.638 185.976 144.163 183.938 150.006 180.554C155.85 177.17 160.865 172.526 164.688 166.96L167.798 162.45C177.44 148.457 185.95 133.717 193.248 118.37L195.598 113.43C198.493 107.337 199.996 100.676 199.996 93.93C199.996 87.1841 198.493 80.5229 195.598 74.43L193.248 69.51Z"></path>
          </clipPath>
        </defs>
      </svg>
    </PageWrapper>
  )
}
