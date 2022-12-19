import { AutoColumn } from '../../../components/Column'
import Row from '../../../components/Row'
import Toggle from '../../../components/Toggle'
import { TYPE } from '../../../theme'

export interface ProfileItemProps {
  tokenId: string
  name: string
  description: string
  activeTokenId?: string
  activate: (tokenId: string) => void
}

export const ProfileItem = ({ activate, activeTokenId, description, name, tokenId }: ProfileItemProps) => {
  return (
    <Row justifyContent="space-between" alignItems="center" width="100%">
      <AutoColumn>
        <TYPE.White fontWeight={500} style={{ textTransform: 'uppercase' }} fontSize={'13px'}>
          {name}
        </TYPE.White>
        <TYPE.Body fontWeight={500} fontSize={'11px'}>
          {description}
        </TYPE.Body>
      </AutoColumn>
      <Toggle id="toggle-expeidtions-tracking" isActive={activeTokenId === tokenId} toggle={() => activate(tokenId)} />
    </Row>
  )
}
