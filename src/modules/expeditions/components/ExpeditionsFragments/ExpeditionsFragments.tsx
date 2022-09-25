import Row from '../../../../components/Row'
import { TYPE } from '../../../../theme'
import { Card, Wrapper } from '../shared'
import { FragmentsBalance } from './ExpeditionsFragments.styled'

export interface ExpeditionsFragmentsBalanceProps {
  balance: number
}

export const ExpeditionsFragmentsBalance = ({ balance }: ExpeditionsFragmentsBalanceProps) => {
  return (
    <Wrapper>
      <Card>
        <Row justifyContent={'space-between'}>
          <TYPE.Body fontWeight={600} letterSpacing={'0.16em'}>
            CURRENT FRAGMENTS
          </TYPE.Body>
          <FragmentsBalance>{balance}&nbsp;&#10024;</FragmentsBalance>
        </Row>
      </Card>
    </Wrapper>
  )
}
