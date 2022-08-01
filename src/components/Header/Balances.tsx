import { Fraction, SWPR } from '@swapr/sdk'

import { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import styled from 'styled-components'

import { useActiveWeb3React, useUnsupportedChainIdError } from '../../hooks'
import { useNativeCurrency } from '../../hooks/useNativeCurrency'
import { useToggleShowClaimPopup } from '../../state/application/hooks'
import { useNativeCurrencyBalance, useTokenBalance } from '../../state/wallet/hooks'
import { Amount } from './styled'

const StyledBalanacesWrapper = styled.div(
  ({ theme }) => `
  position: relative;
  width: 100px;
  height: 22px;
  overflow: hidden;
  padding: 6px 8px;
  margin: 0;
  max-height: 22px;
  font-weight: bold;
  font-size: 10px;
  line-height: 11px;
  text-align: center;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  color: ${theme.text4};
  background: ${theme.bg1};
  border-radius: 8px;

  > #swpr-info, > #eth-balance, > div > .eth-balance-skeleton-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  @keyframes swapr-info-animation {
    0% { opacity: 0; }
    10% { opacity: 1; }
    60% { opacity: 1; }
    70% { opacity: 0; }
  }
  > #swpr-info {
    z-index: 1;
    opacity: 0;
    transition: opacity;
    animation: swapr-info-animation 10s ease infinite;
  }
`
)

export function Balances() {
  const toggleClaimPopup = useToggleShowClaimPopup()
  const nativeCurrency = useNativeCurrency()
  const isUnsupportedChainIdError = useUnsupportedChainIdError()
  const { account, chainId } = useActiveWeb3React()
  const userNativeCurrencyBalance = useNativeCurrencyBalance()
  const accountOrUndefined = useMemo(() => account || undefined, [account])
  const newSwpr = useMemo(() => (chainId ? SWPR[chainId] : undefined), [chainId])
  const newSwprBalance = useTokenBalance(accountOrUndefined, newSwpr)
  const networkWithoutSWPR = !newSwpr

  const numberFormater = Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 3,
  })

  return (
    <StyledBalanacesWrapper onClick={toggleClaimPopup}>
      {!isUnsupportedChainIdError && (
        <>
          <Amount id="eth-balance">
            {userNativeCurrencyBalance ? (
              `${
                userNativeCurrencyBalance.greaterThan(new Fraction('10000'))
                  ? numberFormater.format(parseInt(userNativeCurrencyBalance.toFixed(2)))
                  : userNativeCurrencyBalance.toFixed(3)
              } ${nativeCurrency.symbol}`
            ) : (
              <Skeleton className="eth-balance-skeleton-wrapper" />
            )}
          </Amount>
          {!networkWithoutSWPR && (
            <Amount id="swpr-info">
              {newSwprBalance
                ? newSwprBalance.greaterThan(new Fraction('10000'))
                  ? numberFormater.format(parseInt(newSwprBalance.toFixed(3)))
                  : newSwprBalance.toFixed(3)
                : '0.000'}{' '}
              SWPR
            </Amount>
          )}
        </>
      )}
    </StyledBalanacesWrapper>
  )
}
