import { theme } from '../src/theme'
import { ThemeProvider } from 'styled-components'

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
}

const themeDecorator = storyFn => <ThemeProvider theme={theme(true)}>{storyFn()}</ThemeProvider>
export const decorators = [themeDecorator]
