import styled from 'styled-components'

import {
  getSwapButtonActiveColor,
  getSwapButtonHoverColor,
  TEXT_COLOR_PRIMARY,
  ELEMENTS_BACKGROUND_PRIMARY,
} from '../../constants'
import { FontFamily } from '../styles'

const OX_COLOR = 'linear-gradient(93.39deg, #fff -8.9%, #000 114.08%)'
const BAOSWAP_COLOR = 'linear-gradient(93.39deg, #F0E6E7 -8.9%, #59251B 114.08%)'
const COW_SWAP_COLOR = 'linear-gradient(93.39deg, #2b00a4 -8.9%, #d67b5a 114.08%)'
const DFYN_COLOR = 'linear-gradient(93.39deg, #4DB8E5 -8.9%, #C74D69 114.08%)'
const HONEYSWAP_COLOR = 'linear-gradient(93.39deg, #FFDD0F -8.9%, #7CE0D6 114.08%)'
const LEVINSWAP_COLOR = 'linear-gradient(93.39deg, #A27395 -8.9%, #463E53 114.08%)'
const ONE_INCH_COLOR = 'linear-gradient(93.39deg, #D82122 -8.9%, #1B314F 114.08%)'
const PANCAKESWAP_COLOR = 'linear-gradient(93.39deg, #40D5E1 -8.9%, #D1884F 114.08%)'
const QUICKSWAP_COLOR = 'linear-gradient(93.39deg, #4189C9 -8.9%, #262F71 114.08%)'
const SUSHI_SWAP_COLOR = 'linear-gradient(93.39deg, #2B00A4 -8.9%, #CD45B4 114.08%)'
const CURVE_COLOR = 'linear-gradient(93.39deg, #24FFD3 -8.9%, #D10000 114.08%)'
const SWAPR_COLOR = 'linear-gradient(93.39deg, #4626A1 -8.9%, #0C192B 114.08%)'
const UNISWAP_COLOR = 'linear-gradient(93.39deg, #FF007A -8.9%, #0C192B 114.08%)'
const VELODROME_COLOR = 'linear-gradient(93.39deg, #007FFF -8.9%, #FF1100 114.08%)'

const getBackgroundColor = (platformName?: string) => {
  console.log('PLATFORM', platformName)
  if (!platformName) return 'rgb(46, 23, 242)'

  switch (platformName) {
    case '0x':
      return OX_COLOR
    case '1Inch':
      return ONE_INCH_COLOR
    case 'Baoswap':
      return BAOSWAP_COLOR
    case 'CoW':
      return COW_SWAP_COLOR
    case 'Curve':
      return CURVE_COLOR
    case 'DFYN':
      return DFYN_COLOR
    case 'Honeyswap':
      return HONEYSWAP_COLOR
    case 'Levinswap':
      return LEVINSWAP_COLOR
    case 'Pancakeswap':
      return PANCAKESWAP_COLOR
    case 'Quickswap':
      return QUICKSWAP_COLOR
    case 'Sushiswap':
      return SUSHI_SWAP_COLOR
    case 'Swapr':
      return SWAPR_COLOR
    case 'Uniswap':
      return UNISWAP_COLOR
    case 'Uniswap v2':
      return UNISWAP_COLOR
    case 'Velodrome':
      return VELODROME_COLOR
    default:
      return 'rgb(46, 23, 242)'
  }
}

export const StyledButton = styled.button<{ platformName?: string }>`
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 12px;
  background: ${({ platformName }) => getBackgroundColor(platformName)};
  box-shadow: 0px 0px 42px rgba(129, 62, 127, 0.32);
  cursor: pointer;

  &:hover {
    background: ${({ platformName }) => getSwapButtonHoverColor(getBackgroundColor(platformName))};
  }

  &:active {
    background: ${({ platformName }) => getSwapButtonActiveColor(getBackgroundColor(platformName))};
  }

  &:disabled {
    background: ${ELEMENTS_BACKGROUND_PRIMARY};
    cursor: default;
  }
`

export const SwapButtonLabel = styled.p<{ light?: boolean }>`
  display: inline-block;
  line-height: 16px;
  font-size: 13px;
  ${FontFamily}
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ light }) => (light ? '#8e89c6' : TEXT_COLOR_PRIMARY)};
`

export const PlatformLogo = styled.img`
  width: 21px;
  height: 21px;
`
