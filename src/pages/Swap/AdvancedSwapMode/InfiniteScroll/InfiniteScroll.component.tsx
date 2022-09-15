import { ChainId, Token } from '@swapr/sdk'

import { default as InfiniteScrollCom } from 'react-infinite-scroll-component'

import { Loader } from '../../../../components/Loader'
import { AdvancedViewTransaction } from '../../../../services/AdvancedTradingView/advancedTradingView.types'
import { LoaderContainer, NoDataMessage } from '../AdvancedSwapMode.styles'
import { Trade } from '../Trade/Trade.component'

interface InfiniteScrollProps {
  data: AdvancedViewTransaction[]
  fetchMore: () => Promise<void>
  hasMore: boolean
  showTrades: boolean
  activeCurrencyOption?: Token
  isLoading: boolean
  chainId?: ChainId
  token0: Token
  isFetched: boolean
  scrollableTarget: string
}

export const InfiniteScroll = ({
  chainId,
  data,
  fetchMore,
  hasMore,
  isLoading,
  showTrades,
  activeCurrencyOption,
  token0,
  scrollableTarget,
  isFetched,
}: InfiniteScrollProps) => {
  return (
    <>
      <InfiniteScrollCom
        dataLength={data.length}
        next={fetchMore}
        hasMore={hasMore}
        scrollableTarget={scrollableTarget}
        loader={null}
        scrollThreshold={1}
      >
        {showTrades &&
          activeCurrencyOption &&
          data
            .sort((firstTrade, secondTrade) => Number(secondTrade.timestamp) - Number(firstTrade.timestamp))
            .map((tx, index) => (
              <Trade
                key={`${tx.transactionId}-${index}`}
                isSell={Boolean(tx.isSell)}
                transactionId={tx.transactionId}
                logoKey={tx.logoKey}
                chainId={chainId}
                amountIn={tx.amountIn}
                amountOut={tx.amountOut}
                timestamp={tx.timestamp}
                amountUSD={tx.amountUSD}
                price={activeCurrencyOption?.address === token0.address ? tx.priceToken0 : tx.priceToken1}
              />
            ))}
      </InfiniteScrollCom>
      {isLoading && (
        <LoaderContainer>
          <Loader size="40px" stroke="#8780BF" />
        </LoaderContainer>
      )}
      {!isLoading && isFetched && showTrades && !data.length && (
        <NoDataMessage>
          There is no data for this <span>pair</span>
        </NoDataMessage>
      )}
    </>
  )
}
