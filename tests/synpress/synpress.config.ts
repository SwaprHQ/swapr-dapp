import { defineConfig } from 'cypress'

// @ts-ignore
import * as setupNodeEvents from '@synthetixio/synpress/plugins/index'

export default defineConfig({
  userAgent: 'synpress',
  retries: {
    runMode: 0,
    openMode: 0,
  },
  screenshotsFolder: 'public-report/screenshots',
  videosFolder: 'public-report/videos',
  chromeWebSecurity: true,
  viewportWidth: 1366,
  viewportHeight: 768,
  projectId: 'bqro4k',
  videoCompression: 3,
  video: false,
  env: {
    coverage: false,
  },
  defaultCommandTimeout: 30000,
  pageLoadTimeout: 30000,
  requestTimeout: 30000,
  scrollBehavior: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    baseUrl: 'http://localhost:3000',
    specPattern: 'tests/synpress/specs/**',
    supportFile: 'tests/support/index.js',
    setupNodeEvents,
  },
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
    specPattern: './**/*spec.{js,jsx,ts,tsx}',
  },
})
