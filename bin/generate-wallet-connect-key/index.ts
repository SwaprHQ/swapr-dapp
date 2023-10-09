import dotenv from 'dotenv'
import { mkdir, writeFile } from 'fs/promises'
import { join, resolve } from 'path'

dotenv.config({ path: resolve(__dirname, `../../.env.production`) })

export async function main() {
  const directoryAbsolutePath = './public/.well-known'
  await mkdir(directoryAbsolutePath, { recursive: true })
  const fileAbsolutePath = join(directoryAbsolutePath, '/walletconnect.txt')

  await writeFile(fileAbsolutePath, process.env.WALLET_CONNECT_DOMAIN_VERIFICATION_TEXT ?? '')
  console.log(
    `Generated Wallet Connect text in ${fileAbsolutePath}`,
    process.env.WALLET_CONNECT_DOMAIN_VERIFICATION_TEXT
  )
}

if (require.main === module) {
  main().catch(err => {
    console.error(err)
    process.exit(1)
  })
}
