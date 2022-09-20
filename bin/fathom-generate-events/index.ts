import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { main } from './fathom-generate-events'

const argv = yargs(hideBin(process.argv))
  .option('fathom-site-id', {
    type: 'string',
    requiresArg: true,
    describe: 'Fathom site ID',
  })
  .option('fathom-token', {
    type: 'string',
    requiresArg: true,
    describe: 'Fahtom API token',
  })
  .option('output-directory', {
    type: 'string',
    requiresArg: true,
    describe: 'Output directory',
    default: 'fathom-events',
    alias: 'out',
  })
  .env(true)
  .demandOption('fathom-site-id')
  .demandOption('fathom-token').argv

if (require.main === module) {
  const token = argv['fathom-token']
  const siteId = argv['fathom-site-id']
  const outputDirectory = argv['output-directory']

  main({
    siteId,
    token,
    outputDirectory,
  }).catch(error => {
    console.error(error)
    process.exit(1)
  })
}
