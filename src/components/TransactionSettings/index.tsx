import { ChainId } from '@swapr/sdk'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle } from 'react-feather'

import { useActiveWeb3React } from '../../hooks'
import { MainnetGasPrice } from '../../state/application/actions'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { Option } from '../Option'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import Toggle from '../Toggle'
import { Input, OptionCustom, SlippageErrorInner, SlippageErrorInnerAlertTriangle } from './styleds'

enum RawSlippageValue {
  Min = 1, // 0.01%
  OptionMin = 10, // 0.1%
  RiskyLow = 50, // 0.5%
  OptionMax = 100, // 1%
  RiskyHigh = 500, // 5%
  Max = 5000, // 50%
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh',
  ExtremelyLow = 'ExtremelyLow',
}

enum ErrorMessage {
  InvalidInput = 'Enter a valid slippage tolerance between 0.01% and 50%',
  ExtremelyLow = 'Transaction with extremely low slippage tolerance (0.01% to 0.1%) might be reverted because of very small market movement',
  RiskyLow = 'Your transaction may fail because of low slippage tolerance',
  RiskyHigh = 'Your transaction may be frontrun because of high slippage tolerance',
}

const getSlippageErrorMessage = (slippageError: SlippageError) => {
  switch (slippageError) {
    case SlippageError.InvalidInput:
      return ErrorMessage.InvalidInput
    case SlippageError.ExtremelyLow:
      return ErrorMessage.ExtremelyLow
    case SlippageError.RiskyLow:
      return ErrorMessage.RiskyLow
    case SlippageError.RiskyHigh:
      return ErrorMessage.RiskyHigh
    default:
      return 'Slippage tolerance error'
  }
}

const useValidateTransactionSettings = (
  rawSlippage: number,
  slippageInput: string,
  deadline: number,
  deadlineInput: string
) => {
  const [slippageError, setSlippageError] = useState<SlippageError>()
  const [isSlippageInputValid, setIsSlippageInputValid] = useState(true)
  const [deadlineError, setDeadlineError] = useState<DeadlineError>()
  const [isDeadlineInputValid, setIsDeadlineInputValid] = useState(true)

  useEffect(() => {
    const isInputValid =
      slippageInput.length === 0 ||
      (slippageInput.length > 0 &&
        !Number.isNaN(Number(slippageInput)) &&
        rawSlippage >= RawSlippageValue.Min &&
        rawSlippage < RawSlippageValue.Max &&
        rawSlippage.toFixed(2) === Math.round(Number.parseFloat(slippageInput) * 100).toFixed(2))

    setIsSlippageInputValid(isInputValid)
    if (!isSlippageInputValid) {
      setSlippageError(SlippageError.InvalidInput)
    } else {
      if (rawSlippage < RawSlippageValue.OptionMin) {
        setSlippageError(SlippageError.ExtremelyLow)
      } else if (rawSlippage < RawSlippageValue.RiskyLow) {
        setSlippageError(SlippageError.RiskyLow)
      } else if (rawSlippage > RawSlippageValue.RiskyHigh) {
        setSlippageError(SlippageError.RiskyHigh)
      } else setSlippageError(undefined)
    }
  }, [isSlippageInputValid, rawSlippage, slippageInput])

  useEffect(() => {
    setIsDeadlineInputValid(deadlineInput.length === 0 || (deadline / 60).toString() === deadlineInput)
    !isDeadlineInputValid ? setDeadlineError(DeadlineError.InvalidInput) : setDeadlineError(undefined)
  }, [deadline, deadlineInput, isDeadlineInputValid])

  return {
    slippageError,
    isSlippageInputValid,
    deadlineError,
    isDeadlineInputValid,
  }
}

const SlippageToleranceError = ({ errorMessage, isInputValid }: { errorMessage: string; isInputValid: boolean }) => (
  <SlippageErrorInner data-testid="slippage-error" isInputValid={isInputValid}>
    <SlippageErrorInnerAlertTriangle isInputValid={isInputValid}>
      <AlertTriangle size={20} />
    </SlippageErrorInnerAlertTriangle>
    <p>{errorMessage}</p>
  </SlippageErrorInner>
)

export interface TransactionSettingsProps {
  rawSlippage: number
  setRawSlippage: (rawSlippage: number) => void
  rawPreferredGasPrice: MainnetGasPrice | string | null
  setRawPreferredGasPrice: (rawPreferredGasPrice: MainnetGasPrice | string | null) => void
  deadline: number
  setDeadline: (deadline: number) => void
  multihop: boolean
  onMultihopChange: () => void
}

export const TransactionSettings = ({
  rawSlippage,
  setRawSlippage,
  rawPreferredGasPrice,
  setRawPreferredGasPrice,
  deadline,
  setDeadline,
  multihop,
  onMultihopChange,
}: TransactionSettingsProps) => {
  const { chainId } = useActiveWeb3React()
  const formattedRawSlippage = (rawSlippage / 100).toFixed(2)

  const [slippageInput, setSlippageInput] = useState(formattedRawSlippage)
  const [slippageFocused, setSlippageFocused] = useState(false)
  const [deadlineInput, setDeadlineInput] = useState('')
  const [deadlineFocused, setDeadlineFocused] = useState(false)

  const { isSlippageInputValid, slippageError, deadlineError } = useValidateTransactionSettings(
    rawSlippage,
    slippageInput,
    deadline,
    deadlineInput
  )

  function parseCustomSlippage(slippage: string) {
    setSlippageInput(slippage)

    try {
      const slippageAsIntFromRoundedFloat = Number.parseInt(Math.round(Number.parseFloat(slippage) * 100).toString())
      if (
        !Number.isNaN(slippageAsIntFromRoundedFloat) &&
        slippageAsIntFromRoundedFloat > 0 &&
        slippageAsIntFromRoundedFloat < RawSlippageValue.Max
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
            <TYPE.Body color="text4" fontWeight={500} fontSize="12px" lineHeight="15px" data-testid="multihop-text">
              Multihop
            </TYPE.Body>
            <QuestionHelper text="If off, forces trades to be performed without routing, considerably reducing gas fees (might result in a worse execution price)." />
          </RowFixed>
          <Toggle isActive={multihop} toggle={onMultihopChange} />
        </RowBetween>
        <RowFixed>
          <TYPE.Body
            color="text4"
            fontWeight={500}
            fontSize="12px"
            lineHeight="15px"
            data-testid="slippage-tolerance-text"
          >
            Slippage tolerance
          </TYPE.Body>
          <QuestionHelper text="Your transaction will revert if the price changes unfavorably by more than this percentage." />
        </RowFixed>
        <RowBetween>
          <Option
            onClick={() => {
              setSlippageInput('')
              setRawSlippage(RawSlippageValue.OptionMin)
            }}
            active={rawSlippage === RawSlippageValue.OptionMin}
          >
            0.1%
          </Option>
          <Option
            onClick={() => {
              setSlippageInput('')
              setRawSlippage(RawSlippageValue.RiskyLow)
            }}
            active={rawSlippage === RawSlippageValue.RiskyLow}
          >
            0.5%
          </Option>
          <Option
            onClick={() => {
              setSlippageInput('')
              setRawSlippage(RawSlippageValue.OptionMax)
            }}
            active={rawSlippage === RawSlippageValue.OptionMax}
          >
            1%
          </Option>
          <OptionCustom focused={slippageFocused} warning={!isSlippageInputValid} tabIndex={-1}>
            <RowBetween>
              {/* https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451 */}
              <Input
                data-testid="input-slippage-tolerance"
                placeholder={formattedRawSlippage}
                value={slippageInput}
                onFocus={handleSlippageFocus}
                onBlur={() => {
                  setSlippageFocused(false)
                  parseCustomSlippage(formattedRawSlippage)
                }}
                onChange={e => parseCustomSlippage(e.target.value.replace(',', '.'))}
                color={!isSlippageInputValid ? 'red' : ''}
              />
              %
            </RowBetween>
          </OptionCustom>
        </RowBetween>
        {slippageError ? (
          <SlippageToleranceError
            errorMessage={getSlippageErrorMessage(slippageError)}
            isInputValid={isSlippageInputValid}
          />
        ) : null}
        <RowBetween mt="2px">
          <RowFixed>
            <TYPE.Body
              color="text4"
              fontWeight={500}
              fontSize="12px"
              lineHeight="15px"
              data-testid="transaction-deadline-text"
            >
              Transaction deadline
            </TYPE.Body>
            <QuestionHelper text="Your transaction will revert if it is pending for more than this long." />
          </RowFixed>
          <RowFixed>
            <OptionCustom focused={deadlineFocused} style={{ width: '52px', minWidth: '52px' }} tabIndex={-1}>
              <Input
                data-testid="input-transaction-deadline"
                color={deadlineError ? 'red' : undefined}
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
            <TYPE.Body color="text4" fontSize={14}>
              minutes
            </TYPE.Body>
          </RowFixed>
        </RowBetween>
      </AutoColumn>
    </AutoColumn>
  )
}
