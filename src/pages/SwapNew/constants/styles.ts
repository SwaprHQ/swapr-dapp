// DIMENSIONS
export const SWAPBOX_WIDTH = 'min(467px, 100%)'

// MAIN ELEMENTS COLORS
export const ELEMENTS_BACKGROUND_PRIMARY =
  'radial-gradient(173.28% 128.28% at 50.64% 0%, rgba(170, 162, 255, 0.06) 0%, rgba(0, 0, 0, 0) 100%), rgba(19, 19, 32, 0.5)'
export const ELEMENTS_BACKGROUND_SECONDARY =
  'radial-gradient(160.32% 118.69% at 50.64% 100%, rgba(170, 162, 255, 0.06) 0%, rgba(0, 0, 0, 0) 100%), rgba(19, 19, 32, 0.5)'
export const ELEMENTS_BORDER_PRIMARY =
  'linear-gradient(0deg, rgba(68, 65, 99, 0.05), rgba(68, 65, 99, 0.05)) border-box, radial-gradient(40.58% 91.41% at 50.11% -12.63%, rgba(167, 162, 223, 0.1) 0%, rgba(37, 35, 57, 0.02) 100%) border-box'
export const ELEMENTS_BORDER_SECONDARY =
  'linear-gradient(0deg, rgba(68, 65, 99, 0.05), rgba(68, 65, 99, 0.05)) border-box, radial-gradient(30.27% 68.18% at 50.11% 100%, rgba(167, 162, 223, 0.1) 0%, rgba(37, 35, 57, 0.02) 100%) border-box'
export const DEX_UNSELECTED_BORDER =
  'linear-gradient(0deg, rgba(68, 65, 99, 0.3), rgba(68, 65, 99, 0.3)) border-box, radial-gradient(102.67% 104.54% at 50.11% -12.63%, rgba(68, 65, 99, 0.5) 0%, rgba(37, 35, 57, 0.05) 100%) border-box'
export const DEX_SELECTED_BORDER =
  'linear-gradient(0deg, rgba(14, 159, 110, 0.3), rgba(14, 159, 110, 0.3)) border-box, radial-gradient(102.67% 104.54% at 50.11% -12.63%, rgba(14, 159, 110, 0.5) 0%, rgba(37, 35, 57, 0.05) 100%) border-box'

export const ELEMENTS_SPACING = '6px'

// SWITCH CURRENCIES BUTTON COLORS
export const SWITCH_CURRENCIES_BUTTON_BACKGROUND_COLOR = '#06060a'
export const SWITCH_CURRENCIES_BUTTON_BORDER = '1px solid #0c0c14'
export const SWITCH_CURRENCIES_BUTTON_BOX_SHADOW = '0px 0px 42px rgba(0, 0, 0, 0.42)'

// TOKEN PICKER COLORS
export const TOKEN_PICKER_CLOSE_BUTTON_BACKGROUND_COLOR = 'rgba(60, 56, 100, 0.1)'

// TEXT COLORS
export const TEXT_COLOR_PRIMARY = '#fff'
export const TEXT_COLOR_SECONDARY = '#8780bf'

// INDICATOR VARIANTS AND COLORS
export enum IndicatorColorVariant {
  POSITIVE = 'POSITIVE',
  WARNING = 'WARNING',
  NEGATIVE = 'NEGATIVE',
  UNDEFINED = 'UNDEFINED',
}

export enum IndicatorIconVariant {
  DEXES = 'DEXES',
  GAS = 'GAS',
  BANANA = 'BANANA',
  SHIELD = 'SHIELD',
  MAGNIFYING_GLASS = 'MAGNIFYING_GLASS',
}

export const INDICATOR_COLOR = {
  [IndicatorColorVariant.POSITIVE]: '#0E9F6E',
  [IndicatorColorVariant.WARNING]: '#F2994A',
  [IndicatorColorVariant.NEGATIVE]: '#F02E51',
  [IndicatorColorVariant.UNDEFINED]: '#8780BF',
}

export const INDICATOR_BACKGROUND_COLOR = {
  [IndicatorColorVariant.POSITIVE]: 'rgba(14, 159, 110, 0.15)',
  [IndicatorColorVariant.WARNING]: 'rgba(242, 153, 74, 0.15)',
  [IndicatorColorVariant.NEGATIVE]: 'rgba(240, 46, 81, 0.15)',
  [IndicatorColorVariant.UNDEFINED]: 'rgba(104, 110, 148, 0.1)',
}

export const INDICATOR_COLOR_POSITIVE = '#0E9F6E'
export const INDICATOR_COLOR_WARNING = '#F2994A'
export const INDICATOR_COLOR_NEGATIVE = '#F02E51'
export const INDICATOR_COLOR_UNDEFINED = '#8780BF'

// SWAPBOX BUTTON COLORS AND HELPER FUNCTION
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

export const getSwapboxButtonBackgroundColor = (platformName?: string) => {
  if (!platformName) return 'linear-gradient(90deg, rgba(46,23,242,1) 0%, rgba(80,0,115,1) 100%)'

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
      return 'linear-gradient(90deg, rgba(46,23,242,1) 0%, rgba(80,0,115,1) 100%)'
  }
}

// HELPER COLOR FUNCTIONS
export const getSwapButtonHoverColor = (color: string) =>
  `linear-gradient(0deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)), ${color}`
export const getSwapButtonActiveColor = (color: string) =>
  `linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), ${color}`
