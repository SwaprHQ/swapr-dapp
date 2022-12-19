import { Currency } from '@swapr/sdk'

export type HeaderData = { token0: { value: string; token: Currency }; token1: { value: string; token: Currency } }

export const ConfirmationHeader = ({ data }: { data: HeaderData }) => {
  const someshit = data
  return (
    <div>
      <div>{someshit.token0.token.address}</div>
    </div>
  )
}
