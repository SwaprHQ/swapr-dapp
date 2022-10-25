import { FixedGlobalStyle, theme } from '../src/theme'
import { ThemeProvider } from 'styled-components'
import i18n from './i18next.js'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    sort: 'requiredFirst',
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  layout: 'centered',
  grid: {
    gridOn: true,
    columns: 12,
    gap: '20px',
    gutter: '50px',
    maxWidth: '1024px',
  },
  i18n,
  locale: 'en',
  locales: {
    en: 'English',
  },
}

const themeDecorator = storyFn => (
  <ThemeProvider theme={theme(true)}>
    <FixedGlobalStyle />
    {storyFn()}
  </ThemeProvider>
)
export const decorators = [themeDecorator]
