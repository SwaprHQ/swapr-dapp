import { Link, useSearchParams } from 'react-router-dom'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ButtonPrimary, ButtonSecondary } from '../../../components/Button'
import { AutoColumn } from '../../../components/Column'
import { PairsList } from '../../../components/Pool/PairsList'
import { RowBetween, RowFixed } from '../../../components/Row'
import { UndecoratedLink } from '../../../components/UndercoratedLink'
import { useActiveWeb3React } from '../../../hooks'
import { useLiquidityMiningFeatureFlag } from '../../../hooks/useLiquidityMiningFeatureFlag'
import { useLPPairs } from '../../../hooks/useLiquidityPositions'
import { TYPE } from '../../../theme'
import { PageWrapper } from '../../../ui/PageWrapper'

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`

const ButtonRow = styled(RowFixed)`
  gap: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: column;
    justify-content: space-between;
    margin-bottom: 8px;
  `};
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`

const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`

export default function MyPairs() {
  const { account } = useActiveWeb3React()
  const [search] = useSearchParams()
  const liquidityMiningEnabled = useLiquidityMiningFeatureFlag()
  const { loading: loadingPairs, data } = useLPPairs(account || undefined)

  return (
    <PageWrapper>
      <AutoColumn gap="lg" justify="center">
        <AutoColumn gap="lg" style={{ width: '100%' }}>
          <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
            <Flex alignItems="center">
              <Box mr="8px">
                <UndecoratedLink to="/pools">
                  <TYPE.MediumHeader fontWeight="400" fontSize="26px" lineHeight="32px" color="text4">
                    Pairs
                  </TYPE.MediumHeader>
                </UndecoratedLink>
              </Box>
              <Box mr="8px">
                <TYPE.MediumHeader fontWeight="400" fontSize="26px" lineHeight="32px" color="text4">
                  /
                </TYPE.MediumHeader>
              </Box>
              <Box>
                <TYPE.MediumHeader fontWeight="400" fontSize="26px" lineHeight="32px">
                  MY PAIRS
                </TYPE.MediumHeader>
              </Box>
            </Flex>
            <ButtonRow>
              <ResponsiveButtonPrimary
                id="join-pool-button"
                as={Link}
                padding="8px 14px"
                to={{ pathname: '/pools/create', search: search.toString() }}
              >
                <Text fontWeight={700} fontSize={12}>
                  CREATE PAIR
                </Text>
              </ResponsiveButtonPrimary>
              {liquidityMiningEnabled && (
                <ResponsiveButtonSecondary as={Link} padding="8px 14px" to="/liquidity-mining/create">
                  <Text fontWeight={700} fontSize={12} lineHeight="15px">
                    CREATE REWARDS
                  </Text>
                </ResponsiveButtonSecondary>
              )}
            </ButtonRow>
          </TitleRow>
          <PairsList loading={loadingPairs} aggregatedPairs={data} />
        </AutoColumn>
      </AutoColumn>
    </PageWrapper>
  )
}
