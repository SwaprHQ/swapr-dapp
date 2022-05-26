import React, { CSSProperties, useCallback, useContext, useMemo, useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { Plus, X } from 'react-feather'
import { Box, Flex, Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { Currency, CurrencyAmount, currencyEquals, Token } from '@swapr/sdk'

import { useActiveWeb3React } from '../../../hooks'
import { useCurrencyBalances } from '../../../state/wallet/hooks'
import { useIsUserAddedToken } from '../../../hooks/Tokens'
import { useAddUserToken, useRemoveUserAddedToken } from '../../../state/user/hooks'

import Badge from '../../Badge'
import Loader from '../../Loader'
import { DarkCard } from '../../Card'
import { ImportRow } from '../ImportRow'
import { CurrencyLogo } from '../../CurrencyLogo'
import QuestionHelper from '../../QuestionHelper'
import { TokenPickerItem } from '../shared'
import { AutoRow, RowBetween, RowFixed } from '../../Row'
import { StyledBalanceText, FixedContentRow, StyledFixedSizeList, TokenListLogoWrapper } from './CurrencyList.styles'

import TokenListLogo from '../../../assets/svg/tokenlist.svg'

import { TYPE } from '../../../theme'
import { isTokenOnList } from '../../../utils'
import { currencyKey } from './CurrencyList.utils'
import { WrappedTokenInfo } from '../../../state/lists/wrapped-token-info'

import { BREAK_LINE, CurrencyListProps, CurrencyRowProps, isBreakLine } from './CurrencyList.types'

const Balance = ({ balance }: { balance: CurrencyAmount }) => (
  <StyledBalanceText title={balance.toExact()}>{balance.toSignificant(4)}</StyledBalanceText>
)

const CurrencyRow = ({
  style,
  balance,
  onSelect,
  currency,
  isSelected,
  otherSelected,
  selectedTokenList,
}: CurrencyRowProps) => {
  const { account, chainId } = useActiveWeb3React()
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency)
  const customAdded = useIsUserAddedToken(currency)

  const removeToken = useRemoveUserAddedToken()
  const addToken = useAddUserToken()

  // only show add or remove buttons if not on selected list
  return (
    <TokenPickerItem
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      selected={otherSelected}
      alignItems="center"
      style={style}
    >
      <Box data-testid={'select-button-' + currency.symbol?.toLowerCase()}>
        <AutoRow>
          <CurrencyLogo currency={currency} size={'20px'} />
          <Text marginLeft={'6px'} fontWeight={500}>
            {currency.symbol}
          </Text>
        </AutoRow>
        <AutoRow>
          <TYPE.body marginTop={'4px'} fontSize="9px" color="text4" fontWeight={600}>
            {currency.name?.toUpperCase()}
          </TYPE.body>
        </AutoRow>
      </Box>

      <Flex flex="1" px="20px">
        {!isOnSelectedList && (
          <Box>
            <Badge
              label={customAdded ? 'Added by user' : 'Found by address'}
              icon={customAdded ? X : Plus}
              onClick={event => {
                event.stopPropagation()
                if (!chainId || !(currency instanceof Token)) {
                  return
                }
                if (customAdded) {
                  removeToken(chainId, currency.address)
                } else {
                  addToken(currency)
                }
              }}
            />
          </Box>
        )}
      </Flex>
      <Box style={{ justifySelf: 'flex-end' }}>
        {balance ? <Balance balance={balance} /> : account ? <Loader /> : null}
      </Box>
    </TokenPickerItem>
  )
}

const BreakLineComponent = ({ style }: { style: CSSProperties }) => {
  const theme = useContext(ThemeContext)
  return (
    <FixedContentRow style={style}>
      <DarkCard padding="8px 12px" borderRadius="8px">
        <RowBetween>
          <RowFixed>
            <TokenListLogoWrapper src={TokenListLogo} />
            <TYPE.main ml="6px" fontSize="12px" color={theme.text1}>
              Expanded results from inactive token lists
            </TYPE.main>
          </RowFixed>
          <QuestionHelper text="Tokens from inactive lists. Import specific tokens below or click 'Manage' to activate more lists." />
        </RowBetween>
      </DarkCard>
    </FixedContentRow>
  )
}

export const CurrencyList = ({
  currencies,
  fixedListRef,
  otherCurrency,
  setImportToken,
  showImportView,
  otherListTokens,
  selectedCurrency,
  onCurrencySelect,
  selectedTokenList,
}: CurrencyListProps) => {
  const { account } = useActiveWeb3React()
  const [hasBreakLine, setHasBreakLine] = useState(false)
  const itemData = useMemo(() => {
    if (otherListTokens && otherListTokens?.length > 0) {
      const foundByAddressAndNotInAnyList =
        otherListTokens.length === 1 && !(otherListTokens[0] instanceof WrappedTokenInfo)
      if (foundByAddressAndNotInAnyList) {
        setHasBreakLine(false)
        return otherListTokens
      }
      setHasBreakLine(true)
      return [BREAK_LINE, ...otherListTokens]
    }
    setHasBreakLine(false)
    return currencies
  }, [currencies, otherListTokens])
  const balances = useCurrencyBalances(
    account || undefined,
    (hasBreakLine ? itemData.slice(1) : itemData) as Currency[]
  )

  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: Currency = data[index]
      if (isBreakLine(currency)) return <BreakLineComponent style={style} />
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency))
      const otherSelected = Boolean(otherCurrency && currencyEquals(otherCurrency, currency))
      const showImport = index >= currencies.length
      const handleSelect = () => onCurrencySelect(currency)
      if (showImport && currency && currency instanceof Token) {
        return (
          <ImportRow
            style={style}
            token={currency}
            showImportView={showImportView}
            setImportToken={setImportToken}
            dim
          />
        )
      } else if (currency) {
        return (
          <CurrencyRow
            selectedTokenList={selectedTokenList}
            currency={currency}
            balance={balances[hasBreakLine ? index - 1 : index]}
            isSelected={isSelected}
            onSelect={handleSelect}
            otherSelected={otherSelected}
            style={style}
          />
        )
      }
      return null
    },
    [
      balances,
      currencies.length,
      hasBreakLine,
      onCurrencySelect,
      otherCurrency,
      selectedCurrency,
      selectedTokenList,
      setImportToken,
      showImportView,
    ]
  )

  return (
    <Flex overflowY="auto" flex="1">
      <AutoSizer style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
        {({ width, height }) => (
          <StyledFixedSizeList
            ref={fixedListRef as any}
            width={width}
            height={height}
            itemData={itemData}
            itemCount={itemData.length}
            itemSize={56}
            itemKey={currencyKey}
          >
            {Row}
          </StyledFixedSizeList>
        )}
      </AutoSizer>
    </Flex>
  )
}
