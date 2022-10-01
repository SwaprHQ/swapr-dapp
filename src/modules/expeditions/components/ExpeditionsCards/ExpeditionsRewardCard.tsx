import styled from 'styled-components'

import DxLogo from '../../../../assets/images/logo_white.svg'
import Row from '../../../../components/Row'
import { TYPE } from '../../../../theme'
import { Card, ExpeditionsButton, Wrapper } from '../shared'
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
  expired?: boolean
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
  expired = false,
  imageUrl,
  requiredFragments,
}: RewardCardProps) {
  return (
    <Wrapper>
      <Card flexDirection={'row'} flexWrap={'wrap'} justifyContent={'center'} style={{ gap: '32px' }}>
        <div>
          <ImageWithPlaceholder src={imageUrl} alt={title} />
        </div>
        <div
          style={{
            flex: '1 0 200px',
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
          <ExpeditionsButton
            onClick={onClick}
            disabled={buttonDisabled || expired}
            confirmed={claimed}
            expired={expired}
          >
            {buttonText}
          </ExpeditionsButton>
        </div>
      </Card>
    </Wrapper>
  )
}
