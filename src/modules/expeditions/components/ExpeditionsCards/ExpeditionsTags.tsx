import Skeleton from 'react-loading-skeleton'

import { CustomOutlinedTag } from '../../../../components/Tag'

export type RarityTags = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
export type StatusTags = 'active' | 'upcoming' | 'expired' | 'loading'

interface TagThemeProps {
  color: string
  background?: string
}

type TagTheme<Tags extends string> = { [k in Tags]: TagThemeProps }

export function capitalize(string: string) {
  return string[0].toUpperCase() + string.slice(1)
}

const statusTheme: TagTheme<StatusTags> = {
  active: {
    color: '#118761',
  },
  expired: {
    color: '#9c1c1c',
  },
  loading: {
    color: '',
  },
  upcoming: {
    color: '#a86e3f',
  },
}

const rarityTheme: TagTheme<RarityTags> = {
  common: {
    color: '#686E94',
  },
  uncommon: {
    color: '#0E9F6E',
  },
  rare: {
    color: '#0070dd',
  },
  epic: {
    color: '#a335ee',
  },
  legendary: {
    color: '#ff8000',
  },
  mythic: {
    color: '#e6cc80',
  },
}

export const RarityTag = ({ rarity }: { rarity: RarityTags }) => (
  <CustomOutlinedTag color={rarityTheme[rarity].color}>{capitalize(rarity)}</CustomOutlinedTag>
)

export const StatusTag = ({ status }: { status: StatusTags }) => {
  if (status === 'loading') {
    return <Skeleton width="57.5px" />
  }
  return <CustomOutlinedTag color={statusTheme[status].color}>{capitalize(status)}</CustomOutlinedTag>
}
