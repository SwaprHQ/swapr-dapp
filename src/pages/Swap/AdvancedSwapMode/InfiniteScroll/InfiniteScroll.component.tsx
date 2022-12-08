import { ChainId, Token } from '@swapr/sdk'

import { Trans } from 'react-i18next'
import { default as Scroll } from 'react-infinite-scroll-component'
import Skeleton from 'react-loading-skeleton'

import { AdvancedViewTransaction } from '../../../../services/AdvancedTradingView/advancedTradingView.types'
import { NoDataMessage } from '../AdvancedSwapMode.styles'
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
      <Scroll
        dataLength={data.length}
        next={fetchMore}
        hasMore={hasMore}
        scrollableTarget={scrollableTarget}
        loader={null}
        scrollThreshold={1}
      >
        {showTrades &&
          activeCurrencyOption &&
          data.map((tx, index) => (
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
      </Scroll>
      {isLoading &&
        [...new Array(3)].map((_, key) => (
          <Skeleton key={key} width="100%" height="15px" style={{ marginTop: '10px' }} />
        ))}
      {!isLoading && isFetched && showTrades && !data.length && (
        <NoDataMessage>
          <Trans i18nKey="swap:advancedTradingView.infiniteScroll.noData" components={[<span key="0"></span>]} />
        </NoDataMessage>
      )}
    </>
  )
}
