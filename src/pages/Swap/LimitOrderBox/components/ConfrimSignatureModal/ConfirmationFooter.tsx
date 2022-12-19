import { Button } from '../../../../../theme'

export type FooterData = {
  askPrice: string
  marketPriceDifference: { value: string; color: string }
  expiresIn: string
  market: string
}

export const ConfirmationFooter = ({ data, onConfirm }: { data: FooterData; onConfirm: () => void }) => {
  const someshit = data
  return (
    <div>
      <div>{someshit.askPrice}</div>
      <Button onClick={onConfirm}></Button>
    </div>
  )
}
