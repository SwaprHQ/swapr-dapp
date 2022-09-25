import styled from 'styled-components'

import DxLogo from '../../../../assets/images/logo_white.svg'
import { ButtonConfirmed } from '../../../../components/Button'
import Row from '../../../../components/Row'
import { TYPE } from '../../../../theme'
import { Card, Wrapper } from '../shared'
import { RarityTag, RarityTags } from './ExpeditionsTags'

export interface RewardCardProps {
  imageUrl: string
  rarity: RarityTags
  title: string
  description: string
  buttonText: React.ReactNode
  buttonDisabled?: boolean
  onClick?: () => void
  claimed?: boolean
  requiredFragments?: number
}

const ImageWithPlaceholder = styled.img`
  background-image: url(${DxLogo});
  width: 200px;
  height: 200px;
  background-position: center;
  background-repeat: no-repeat;
  border: 2px solid #2a2f42;
  border-radius: 8px;
`

// Buttons to be implemented as needed. Maybe fixed set of buttons or button can be passed as child

export function RewardCard({
  title,
  description,
  rarity,
  buttonText,
  buttonDisabled = false,
  onClick,
  claimed = false,
  imageUrl,
  requiredFragments,
}: RewardCardProps) {
  return (
    <Wrapper>
      <Card flexDirection={'row'} style={{ gap: '32px' }}>
        <div>
          <ImageWithPlaceholder src={imageUrl} alt={title} />
        </div>
        <div
          style={{
            flex: '1 0 0',
            display: 'flex',
            gap: '16px',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Row justifyContent={'space-between'}>
            <TYPE.White fontSize="20px">{title}</TYPE.White>
            <RarityTag rarity={rarity} />
          </Row>
          <TYPE.White fontSize="14px">{description}</TYPE.White>
          {requiredFragments && (
            <TYPE.White fontSize="14px">{`Collect ${requiredFragments} fragments to claim this NFT.`}</TYPE.White>
          )}
          <ButtonConfirmed padding="8px" onClick={onClick} disabled={buttonDisabled} confirmed={claimed}>
            {buttonText}
          </ButtonConfirmed>
        </div>
      </Card>
    </Wrapper>
  )
}
