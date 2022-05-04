import { Box, Flex, Text } from 'rebass'
import { Pair } from '@swapr/sdk'
import { useHistory } from 'react-router-dom'
import { usePrevious } from 'react-use'

import { usePair24hVolumeUSD } from '../../../hooks/usePairVolume24hUSD'
import { useIsSwitchingToCorrectChain } from '../../../state/multi-chain-links/hooks'
import { usePairCampaignIndicatorAndLiquidityUSD } from '../../../hooks/usePairCampaignIndicatorAndLiquidityUSD'
import { useActiveWeb3React } from '../../../hooks'
import { formatCurrencyAmount } from '../../../utils'
import { ButtonExternalLink } from '../../Button'
import { DimBlurBgBox } from '../DimBlurBgBox'
import { InfoSnippet } from './InfoSnippet'
interface PairViewProps {
  loading: boolean
  pair?: Pair | null
}
function PoolStats({ pair }: PairViewProps) {
  const { chainId } = useActiveWeb3React()
  const history = useHistory()
  const previousChainId = usePrevious(chainId)
  const { volume24hUSD } = usePair24hVolumeUSD(pair?.liquidityToken.address)
  const { liquidityUSD } = usePairCampaignIndicatorAndLiquidityUSD(pair)
  const switchingToCorrectChain = useIsSwitchingToCorrectChain()

  const statsLink = pair?.liquidityToken.address
    ? `https://dxstats.eth.link/#/pair/${pair?.liquidityToken.address}?chainId=${chainId}`
    : `https://dxstats.eth.link/#/pairs?chainId=${chainId}`

  useEffect(() => {
    // when the chain is switched, and not as a reaction to following a multi chain link
    // (which might require changing chains), redirect to generic pools page
    if (chainId && previousChainId && chainId !== previousChainId && !switchingToCorrectChain) {
      history.push('/pools')
    }
  }, [chainId, history, previousChainId, switchingToCorrectChain])

  return (
    <DimBlurBgBox padding={'24px'}>
      <Flex alignItems="center" justifyContent="space-between" paddingBottom={'24px'}>
        <Text fontSize="16px" mb="24px">
          Pool Stats
        </Text>
        <Box>
          <ButtonExternalLink link={statsLink}>Stats</ButtonExternalLink>
        </Box>
      </Flex>
      <Flex alignItems="center" justifyContent="space-between">
        <InfoSnippet title="tlv" value={`$${formatCurrencyAmount(liquidityUSD)}`} />
        <InfoSnippet title="24h volume" value={`$${formatCurrencyAmount(volume24hUSD)}`} />
        <InfoSnippet title="APY" value="0.1%" big />
      </Flex>
    </DimBlurBgBox>
  )
}

export default PoolStats
