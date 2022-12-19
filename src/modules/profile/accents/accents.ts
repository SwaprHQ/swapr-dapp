export interface Accent {
  tokenId: string
  name: string
  imageURI: string
  description: string
  gradientColors: string[]
}

export const SUPPORTED_ACCENTS: { [tokenId: string]: Accent } = {
  '2': {
    tokenId: '2',
    name: 'Visions of Scourge',
    imageURI: 'ipfs://QmRo7LhZFJHkVqKkQL9ySbEX1pyPXVvUZ7Xz9zDQNK765f/2.png',
    description: 'Unlocked in expeditions beta',
    gradientColors: ['#FC7C23', '#C65110', '#573541', '#541D3F'],
  },
  '4': {
    tokenId: '4',
    name: 'Visions of Creation',
    imageURI: 'ipfs://QmRo7LhZFJHkVqKkQL9ySbEX1pyPXVvUZ7Xz9zDQNK765f/4.png',
    description: 'Unlocked in expeditions beta',
    gradientColors: ['#0D121C', '#184657', '#2D8270', '#F0F4D3'],
  },
  '6': {
    tokenId: '6',
    name: 'Visions of Depth',
    imageURI: 'ipfs://QmRo7LhZFJHkVqKkQL9ySbEX1pyPXVvUZ7Xz9zDQNK765f/6.png',
    description: 'Unlocked in expeditions beta',
    gradientColors: ['#AFC1C4', '#38A7C4', '#145D88', '#0E2D51'],
  },
  '8': {
    tokenId: '8',
    name: 'Visions of Cessation',
    imageURI: 'ipfs://QmRo7LhZFJHkVqKkQL9ySbEX1pyPXVvUZ7Xz9zDQNK765f/8.png',
    description: 'Unlocked in expeditions beta',
    gradientColors: ['#D53D41', '#9D333A', '#852D32', '#47121D'],
  },
  '10': {
    tokenId: '10',
    name: 'Visions of Grandeur',
    imageURI: 'ipfs://QmRo7LhZFJHkVqKkQL9ySbEX1pyPXVvUZ7Xz9zDQNK765f/10.png',
    description: 'Unlocked in expeditions beta',
    gradientColors: ['#C0AD93', '#C0AD93', '#F2E6D8', '#FFF061'],
  },
}
