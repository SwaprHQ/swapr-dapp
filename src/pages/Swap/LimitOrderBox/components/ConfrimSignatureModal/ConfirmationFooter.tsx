import { Button } from '../../../../../theme'

export type FooterData = {
  askPrice: string
  marketPriceDifference: number
  isDiffPositive: boolean
  expiresIn: string
  market: string
  onConfirm: () => void
}

export const ConfirmationFooter = ({
  askPrice,
  onConfirm,
  expiresIn,
  marketPriceDifference,
  isDiffPositive,
  market,
}: FooterData) => {
  console.log('isDiffPositive', isDiffPositive)
  return (
    <div>
      <div>AskPrice:{askPrice}</div>
      <div>Diff market price: {marketPriceDifference}</div>
      <div>Expires in : {expiresIn}</div>
      <div>Market:{market}</div>
      <Button onClick={onConfirm}></Button>
    </div>
  )
}
