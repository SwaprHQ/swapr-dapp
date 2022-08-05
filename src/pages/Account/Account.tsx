import Avatar from 'boring-avatars'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { ExternalLink } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { Box, Flex, Heading, Image, Link, Text } from 'rebass'
import styled from 'styled-components'

import { networkOptionsPreset } from '../../components/NetworkSwitcher'
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
import { formatNumber } from '../../utils/formatNumber'
import CopyWrapper from './CopyWrapper'
import { formattedTransactions, type Transaction } from './filterTransactions'

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
              <Flex flex="14%" justifyContent="right" sx={{ pr: 2 }}>
                From
              </Flex>
              <Flex flex="14%" justifyContent="right" sx={{ pr: 2 }}>
                To
              </Flex>
              <Flex flex="15%" justifyContent="right" sx={{ pr: 2 }}>
                Price
              </Flex>
              <Flex flex="14%" justifyContent="center">
                Status
              </Flex>
              <Flex flex="15%" justifyContent="center">
                Time
              </Flex>
              <Flex flex="13%" justifyContent="center">
                Details
              </Flex>
            </Header>
          </HeaderText>
        </ListLayout>
        {transactions?.map(({ type, status, from, to, hash, addedTime, confirmedTime = addedTime, network }) => (
          <GridCard key={hash} status={status}>
            {allNetworkTransactions && (
              <Flex flex="5%">
                <Image
                  sx={{ width: '20px' }}
                  src={networkOptionsPreset.find(n => n.chainId == network)?.logoSrc}
                  alt="adas"
                />
              </Flex>
            )}
            <Flex flex="8%">{`${type}`}</Flex>
            <Flex flex="14%" justifyContent="right" sx={{ pr: 2 }}>{`${formatNumber(from.value, false, true)} ${
              from.token
            }`}</Flex>
            <Flex flex="14%" justifyContent="right" sx={{ pr: 2 }}>{`${formatNumber(to.value, false, true)} ${
              to.token
            }`}</Flex>

            <Flex flex="15%" justifyContent="right" sx={{ pr: 2 }}>{`${formatNumber(
              to.value / from.value,
              true,
              true
            )}`}</Flex>

            <Flex flex="15%" justifyContent="center">
              <Status status={status}>{status}</Status>
            </Flex>
            <Flex flex="15%" justifyContent="center">
              {confirmedTime ? DateTime.fromMillis(confirmedTime).toFormat('yyyy-MM-dd HH:mm:ss') : '- -'}
            </Flex>
            <Flex flex="12%" justifyContent="center">
              Details
            </Flex>
          </GridCard>
        ))}
      </DimBlurBgBox>
    </PageWrapper>
  )
}

const GridCard = styled(Flex)<{ status: string }>`
  row-gap: 24px;
  padding: 22px;
  font-size: 13px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 22px 10px
  `};
  background: ${({ status }) => {
    switch (status) {
      case 'COMPLETED':
        return 'linear-gradient(256.45deg, rgba(15, 152, 106, 0.2) 6.32%, rgba(15, 152, 106, 0) 65.79%)'
      case 'PENDING':
        return 'linear-gradient(256.45deg, rgba(242, 153, 74, 0.2) 8.84%, rgba(242, 153, 74, 0) 55.62%)'
      default:
        return 'inherit'
    }
  }};
`

const Status = styled(Flex)<{ status: string }>`
  text-transform: uppercase;
  padding: 4px;
  font-size: 9px;
  border-radius: 6px;
  color: #0e9f6e;
  font-weight: 700;
  border-width: 1.5px;
  border-color: #0e9f6e;
  border-style: solid;
`

const CustomLinkIcon = styled(ExternalLink)`
  color: ${({ theme }) => theme.text5};
`

const StyledLink = styled(Link)`
  font-size: inherit;
  display: flex;
  color: ${({ theme }) => theme.text4};
  margin-left: 4px;
  align-items: center;
  :hover,
  :active,
  :focus {
    text-decoration: none;
    color: ${({ theme }) => theme.text2};
  }
`
