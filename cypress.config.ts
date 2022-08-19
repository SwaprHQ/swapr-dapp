import { defineConfig } from 'cypress'

export default defineConfig({
  videoCompression: false,
  userAgent: 'synpress',
  projectId: 'bqro4k',
  retries: {
    runMode: 0,
    openMode: 0,
  },
  screenshotsFolder: 'public-report/screenshots',
  videosFolder: 'public-report/videos',
  chromeWebSecurity: true,
  viewportWidth: 1366,
  viewportHeight: 768,
  video: false,
  env: {
    coverage: false,
  },
  defaultCommandTimeout: 30000,
  pageLoadTimeout: 30000,
  requestTimeout: 30000,
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'mochawesome-report',
    charts: true,
    overwrite: false,
    html: false,
    json: true,
    reportPageTitle: 'My Test Suite',
    embeddedScreenshots: true,
    inlineAssets: true,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    baseUrl: 'http://localhost:3000',
    specPattern: 'tests/cypress/integration/**/*.{js,jsx,ts,tsx}',
    supportFile: 'tests/cypress/support/index.ts',
  },
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
    specPattern: './**/*spec.{js,jsx,ts,tsx}',
  },
})
