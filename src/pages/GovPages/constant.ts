import { Currency } from 'dxswap-sdk'
import { DAI, USDC, USDT, COMP, MKR, AMPL, WBTC } from '../../constants'
import { ProposalProps } from './Proposals/Proposals'

export const MainPage = 'Governance Main Page'
export const PairPage = 'Governance Pair Page'

export const temporaryCurrencyData: Array<Currency> = [DAI, USDC, USDT, COMP, MKR, AMPL, WBTC]

export const fakeProposalData: ProposalProps[] = [
  {
    id: 1,
    title: 'USDC/ETH Pool Fee to 0.05%',
    totalVote: 45,
    for: 35,
    against: 10,
    until: new Date('Jan 18, 2021 03:24:00').getTime()
  },
  {
    id: 2,
    title: 'USDC/ETH Pool Fee to 0.09%',
    totalVote: 45,
    for: 10,
    against: 35,
    until: new Date('Jan 16, 2021 03:24:00').getTime()
  },
  {
    id: 3,
    title: 'USDC/ETH Pool Fee to 0.15%',
    totalVote: 23,
    for: 20,
    against: 3,
    until: new Date('Feb 25, 2021 03:24:00').getTime()
  }
]
