export const SWAPBOX_WIDTH = 'min(467px, 100%)'
export const ELEMENTS_BACKGROUND_PRIMARY =
  'radial-gradient(173.28% 128.28% at 50.64% 0%, rgba(170, 162, 255, 0.06) 0%, rgba(0, 0, 0, 0) 100%), rgba(19, 19, 32, 0.5)'
export const ELEMENTS_BACKGROUND_SECONDARY =
  'radial-gradient(160.32% 118.69% at 50.64% 100%, rgba(170, 162, 255, 0.06) 0%, rgba(0, 0, 0, 0) 100%), rgba(19, 19, 32, 0.5)'
export const ELEMENTS_BORDER_PRIMARY =
  'linear-gradient(0deg, rgba(68, 65, 99, 0.05), rgba(68, 65, 99, 0.05)) border-box, radial-gradient(40.58% 91.41% at 50.11% -12.63%, rgba(167, 162, 223, 0.1) 0%, rgba(37, 35, 57, 0.02) 100%) border-box'
export const ELEMENTS_BORDER_SECONDARY =
  'linear-gradient(0deg, rgba(68, 65, 99, 0.05), rgba(68, 65, 99, 0.05)) border-box, radial-gradient(30.27% 68.18% at 50.11% 100%, rgba(167, 162, 223, 0.1) 0%, rgba(37, 35, 57, 0.02) 100%) border-box'
export const ELEMENTS_SPACING = '6px'
export const TEXT_COLOR_PRIMARY = '#fff'
export const TEXT_COLOR_SECONDARY = '#8780bf'

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
}

export const INDICATOR_COLOR = {
  [IndicatorColorVariant.POSITIVE]: '#0E9F6E',
  [IndicatorColorVariant.WARNING]: '#F2994A',
  [IndicatorColorVariant.NEGATIVE]: '#F02E51',
  [IndicatorColorVariant.UNDEFINED]: '#8780BF',
}

export const INDICATOR_BACKGROUND_COLOR = {
  [IndicatorColorVariant.POSITIVE]: '#0e9f6e14',
  [IndicatorColorVariant.WARNING]: '#f2994a14',
  [IndicatorColorVariant.NEGATIVE]: '#f02e5114',
  [IndicatorColorVariant.UNDEFINED]: '#8780bf14',
}

export const INDICATOR_COLOR_POSITIVE = '#0E9F6E'
export const INDICATOR_COLOR_WARNING = '#F2994A'
export const INDICATOR_COLOR_NEGATIVE = '#F02E51'
export const INDICATOR_COLOR_UNDEFINED = '#8780BF'

export const getSwapButtonHoverColor = (color: string) =>
  `linear-gradient(0deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)), ${color}`
export const getSwapButtonActiveColor = (color: string) =>
  `linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), ${color}`
