export const SWAPBOX_WIDTH = 'min(467px, 100%)'
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
export const TOKEN_PICKER_CLOSE_BUTTON_BACKGROUND_COLOR = 'rgba(60, 56, 100, 0.1)'
export const SWITCH_CURRENCIES_BUTTON_BACKGROUND_COLOR = '#06060a'
export const SWITCH_CURRENCIES_BUTTON_BORDER = '1px solid #0c0c14'
export const SWITCH_CURRENCIES_BUTTON_BOX_SHADOW = '0px 0px 42px rgba(0, 0, 0, 0.42)'

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

export const getSwapButtonHoverColor = (color: string) =>
  `linear-gradient(0deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)), ${color}`
export const getSwapButtonActiveColor = (color: string) =>
  `linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), ${color}`
