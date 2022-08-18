import { parseUnits } from '@ethersproject/units'

import { useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import Select from 'react-select'

import { ERC20ishToken, NativeToken, TokenAmount } from '../../interfaces/token.interface'

export interface TokenAmountSelectorProps {
  tokenList: (NativeToken | ERC20ishToken)[]
  initialAmount?: string
  initialToken?: string
  onChange?: (tokenAmount: TokenAmount<ERC20ishToken | NativeToken>) => void
}

const invalidChars = ['-', '+', 'e']

export function TokenAmountSelector({ tokenList }: TokenAmountSelectorProps) {
  const [displayAmount, setDisplayAmount] = useState('') // amount in display format decimal
  const [tokenAmount, setTokenAmount] = useState<TokenAmount<ERC20ishToken | NativeToken>>()
  const [token, setToken] = useState<ERC20ishToken | NativeToken>()

  return (
    <div>
      <input
        type="number"
        value={displayAmount}
        onKeyDown={e => {
          if (invalidChars.includes(e.key)) {
            e.preventDefault()
          }
        }}
        onChange={e => {
          unstable_batchedUpdates(() => {
            setDisplayAmount(e.target.value)
            setTokenAmount({
              amount: parseUnits(e.target.value, token?.decimals).toString(), // amount is in wei
              // @ts-expect-error
              token, // token is the selected token,
            })
          })
        }}
      />
      <Select
        options={tokenList.map(token => ({
          value: token.address,
          label: token.symbol,
          token,
        }))}
        onChange={option => {
          if (option) {
            setToken(option.token)
            // update the token amount with the new token
            if (tokenAmount) {
              setTokenAmount({
                amount: tokenAmount.amount,
                token: option.token,
              })
            }
          }
        }}
      />
    </div>
  )
}
