import React, { useState, useCallback, useEffect } from 'react'
import styled, { css } from 'styled-components'
import { Text } from 'rebass'
import { ChainId } from '@swapr/sdk'

import QuestionHelper from '../QuestionHelper'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'

import border8pxRadius from '../../assets/images/border-8px-radius.png'
import { MainnetGasPrice } from '../../state/application/actions'
import { Option } from '../Option'
import Toggle from '../Toggle'
import { useActiveWeb3React } from '../../hooks'

enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

const Input = styled.input`
  background: ${({ theme }) => theme.bg2};
  font-size: 15px;
  line-height: 18px;
  width: auto;
  outline: none;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  color: ${({ theme, color }) => (color === 'red' ? theme.red1 : theme.text1)};
  text-align: right;
  display: flex;
`

const OptionCustom = styled(Option)<{ active?: boolean; warning?: boolean; focused?: boolean }>`
  position: relative;
  flex: 1;
  display: flex;
  border: 8px solid;
  border-radius: 8px;
  ${({ focused }) =>
    focused
      ? css`
          border: solid 1px ${({ theme }) => theme.bg5};
          padding: 7px 11px;
        `
      : css`
          border: 8px solid transparent;
          border-image: url(${border8pxRadius}) 8;
          padding: 0px 4px;
        `};

  input {
    width: 100%;
    height: 100%;
    border: 0px;
    border-radius: 8px;
  }
`

const SlippageEmojiContainer = styled.span`
  color: #f3841e;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;  
  `}
`

export interface SlippageTabsProps {
  rawSlippage: number
  setRawSlippage: (rawSlippage: number) => void
  rawPreferredGasPrice: MainnetGasPrice | string | null
  setRawPreferredGasPrice: (rawPreferredGasPrice: MainnetGasPrice | string | null) => void
  deadline: number
  setDeadline: (deadline: number) => void
  multihop: boolean
  onMultihopChange: () => void
}

export default function SlippageTabs({
  rawSlippage,
  setRawSlippage,
  rawPreferredGasPrice,
  setRawPreferredGasPrice,
  deadline,
  setDeadline,
  multihop,
  onMultihopChange,
}: SlippageTabsProps) {
  const { chainId } = useActiveWeb3React()

  const [slippageInput, setSlippageInput] = useState('')
  const [slippageFocused, setSlippageFocused] = useState(false)
  const [deadlineInput, setDeadlineInput] = useState('')
  const [deadlineFocused, setDeadlineFocused] = useState(false)

  const slippageInputIsValid =
    slippageInput === '' ||
    (!Number.isNaN(Number(slippageInput)) &&
      rawSlippage.toFixed(2) === Math.round(Number.parseFloat(slippageInput) * 100).toFixed(2))

  const deadlineInputIsValid = deadlineInput === '' || (deadline / 60).toString() === deadlineInput

  let slippageError: SlippageError | undefined
  if (slippageInput !== '' && !slippageInputIsValid) {
    slippageError = SlippageError.InvalidInput
  } else if (slippageInputIsValid && rawSlippage < 50) {
    slippageError = SlippageError.RiskyLow
  } else if (slippageInputIsValid && rawSlippage > 500) {
    slippageError = SlippageError.RiskyHigh
  } else {
    slippageError = undefined
  }

  let deadlineError: DeadlineError | undefined
  if (deadlineInput !== '' && !deadlineInputIsValid) {
    deadlineError = DeadlineError.InvalidInput
  } else {
    deadlineError = undefined
  }

  function parseCustomSlippage(slippage: string) {
    setSlippageInput(slippage)

    try {
      const slippageAsIntFromRoundedFloat = Number.parseInt(Math.round(Number.parseFloat(slippage) * 100).toString())

      if (
        !Number.isNaN(slippageAsIntFromRoundedFloat) &&
        slippageAsIntFromRoundedFloat > 0 &&
        slippageAsIntFromRoundedFloat < 5000
      ) {
        setRawSlippage(slippageAsIntFromRoundedFloat)
      }
    } catch {}
  }

  function parseCustomDeadline(customDeadline: string) {
    setDeadlineInput(customDeadline)

    try {
      const customDeadlineAsInt: number = Number.parseInt(customDeadline) * 60
      if (!Number.isNaN(customDeadlineAsInt) && customDeadlineAsInt > 0) {
        if (Number(customDeadlineAsInt) > Number.MAX_SAFE_INTEGER) throw new Error('Deadline overflow')
        setDeadline(customDeadlineAsInt)
      }
    } catch {}
  }

  useEffect(() => {
    // if user switches network, going away from mainnet, but gas price is set to be one of the
    // mainnet gas values fetched from the gas price API, delete the preferred mainnet gas price in the state
    if (chainId !== ChainId.MAINNET && rawPreferredGasPrice && rawPreferredGasPrice in MainnetGasPrice) {
      setRawPreferredGasPrice(null)
    }
  }, [chainId, rawPreferredGasPrice, setRawPreferredGasPrice])

  const handleSlippageFocus = useCallback(() => {
    setSlippageFocused(true)
  }, [])

  const handleDeadlineFocus = useCallback(() => {
    setDeadlineFocused(true)
  }, [])

  return (
    <AutoColumn gap="16px">
      <AutoColumn gap="12px">
        <RowBetween>
          <RowFixed>
            <TYPE.body color="text4" fontWeight={500} fontSize="12px" lineHeight="15px" data-testid="multihop-text">
              Multihop
            </TYPE.body>
            <QuestionHelper text="If off, forces trades to be performed without routing, considerably reducing gas fees (might result in a worse execution price)." />
          </RowFixed>
          <Toggle isActive={multihop} toggle={onMultihopChange} />
        </RowBetween>
        <RowFixed>
          <TYPE.body
            color="text4"
            fontWeight={500}
            fontSize="12px"
            lineHeight="15px"
            data-testid="slippage-tolerance-text"
          >
            Slippage tolerance
          </TYPE.body>
          <QuestionHelper text="Your transaction will revert if the price changes unfavorably by more than this percentage." />
        </RowFixed>
        <RowBetween>
          <Option
            onClick={() => {
              setSlippageInput('')
              setRawSlippage(10)
            }}
            active={rawSlippage === 10}
          >
            0.1%
          </Option>
          <Option
            onClick={() => {
              setSlippageInput('')
              setRawSlippage(50)
            }}
            active={rawSlippage === 50}
          >
            0.5%
          </Option>
          <Option
            onClick={() => {
              setSlippageInput('')
              setRawSlippage(100)
            }}
            active={rawSlippage === 100}
          >
            1%
          </Option>
          <OptionCustom focused={slippageFocused} warning={!slippageInputIsValid} tabIndex={-1}>
            <RowBetween>
              {!!slippageInput &&
              (slippageError === SlippageError.RiskyLow || slippageError === SlippageError.RiskyHigh) ? (
                <SlippageEmojiContainer>
                  <span role="img" aria-label="warning">
                    ⚠️
                  </span>
                </SlippageEmojiContainer>
              ) : null}
              {/* https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451 */}
              <Input
                data-testid="input-slippage-tolerance"
                placeholder={(rawSlippage / 100).toFixed(2)}
                value={slippageInput}
                onFocus={handleSlippageFocus}
                onBlur={() => {
                  setSlippageFocused(false)
                  parseCustomSlippage((rawSlippage / 100).toFixed(2))
                }}
                onChange={e => parseCustomSlippage(e.target.value)}
                color={!slippageInputIsValid ? 'red' : ''}
              />
              %
            </RowBetween>
          </OptionCustom>
        </RowBetween>
        {!!slippageError && (
          <Text
            data-testid="slippage-error"
            fontWeight={500}
            fontSize="12px"
            lineHeight="15px"
            color={slippageError === SlippageError.InvalidInput ? 'red' : '#F3841E'}
          >
            {slippageError === SlippageError.InvalidInput
              ? `Enter a valid ${slippageError === SlippageError.InvalidInput ? 'slippage percentage' : 'gas price'}`
              : slippageError === SlippageError.RiskyLow
              ? 'Your transaction may fail'
              : 'Your transaction may be frontrun'}
          </Text>
        )}
        <RowBetween mt="2px">
          <RowFixed>
            <TYPE.body
              color="text4"
              fontWeight={500}
              fontSize="12px"
              lineHeight="15px"
              data-testid="transaction-deadline-text"
            >
              Transaction deadline
            </TYPE.body>
            <QuestionHelper text="Your transaction will revert if it is pending for more than this long." />
          </RowFixed>
          <RowFixed>
            <OptionCustom focused={deadlineFocused} style={{ width: '52px', minWidth: '52px' }} tabIndex={-1}>
              <Input
                data-testid="input-transaction-deadline"
                color={!!deadlineError ? 'red' : undefined}
                onFocus={handleDeadlineFocus}
                onBlur={() => {
                  setDeadlineFocused(false)
                  parseCustomDeadline((deadline / 60).toString())
                }}
                placeholder={(deadline / 60).toString()}
                value={deadlineInput}
                onChange={e => parseCustomDeadline(e.target.value)}
              />
            </OptionCustom>
            <TYPE.body color="text4" fontSize={14}>
              minutes
            </TYPE.body>
          </RowFixed>
        </RowBetween>
      </AutoColumn>
    </AutoColumn>
  )
}
