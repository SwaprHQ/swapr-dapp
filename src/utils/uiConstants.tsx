import TextyAnim from 'rc-texty'

import Entry2 from './../assets/images/blog/blog-entry-2.jpg'
import EcoRouterArticle from './../assets/images/blog/ecorouter-article.png'
import MevArticle from './../assets/images/blog/mev-article.png'
import BNBLogo from './../assets/images/BNBLogo.svg'
import Bridge from './../assets/images/features/bridge.png'
import DiyFarm from './../assets/images/features/diy-farm.png'
import EcoRouting from './../assets/images/features/eco-routing.png'
import Farming from './../assets/images/features/farm.png'
import Swap from './../assets/images/features/swap.png'
import Vote from './../assets/images/features/vote.png'
import gnosisChainLogo from './../assets/images/gnosis-chain.svg'
import BaoSwapStats from './../assets/images/isologo-baoswap.svg'
import Discord from './../assets/images/isologo-discord.svg'
import Github from './../assets/images/isologo-github.svg'
import HoneySwapStats from './../assets/images/isologo-honeyswap.svg'
import SushiSwapStats from './../assets/images/isologo-sushiswap.svg'
import Twitter from './../assets/images/isologo-twitter.svg'
import UniSwapStats from './../assets/images/isologo-uniswap.svg'
import RoutingLevinSwap from './../assets/images/levinswap.svg'
import ArbitrumLogo from './../assets/images/logo-Arbitrum.svg'
import EthereumLogo from './../assets/images/logo-Ethereum.svg'
import PolygonLogo from './../assets/images/logo-Polygon.svg'
import xDaiLogo from './../assets/images/logo-xDai.svg'
import OptimismLogo from './../assets/images/optimism.svg'
import RoutingOneInch from './../assets/images/routing-1inch.svg'
import RoutingBaoSwap from './../assets/images/routing-BaoSwap.svg'
import RoutingCoW from './../assets/images/routing-cow.svg'
import RoutingCurve from './../assets/images/routing-curve.svg'
import RoutingDFYN from './../assets/images/routing-DFYN.svg'
import RoutingHoneySwap from './../assets/images/routing-HoneySwap.svg'
import RoutingPancakeSwap from './../assets/images/routing-pancakeswap.svg'
import RoutingQuickSwap from './../assets/images/routing-Quickswap.svg'
import RoutingSushiSwap from './../assets/images/routing-SushiSwap.svg'
import RoutingUniswap from './../assets/images/routing-Uniswap.svg'
import { scrollTo } from './helperFunctions'

export const mainNavigation = [
  {
    label: 'Documentation',
    href: 'http://dxdocs.eth.limo.ipns.localhost:8080/docs/Products/swapr/',
  },
  {
    label: 'Stats',
    href: '/#stats',
  },
  {
    label: 'Launch Swapr',
    href: '#',
    cta: true,
  },
]

export const HeroContent = {
  mainText: (
    <span>
      Swap, Farm, Bridge and
      <br /> Vote on Defi unchained.
    </span>
  ),
  heroLogos: [
    {
      img: EthereumLogo,
      title: 'Ethereum',
    },
    {
      img: ArbitrumLogo,
      title: 'Arbitrum',
    },
    {
      img: xDaiLogo,
      title: 'xDai',
    },
    {
      img: PolygonLogo,
      title: 'Polygon',
    },
    {
      img: OptimismLogo,
      title: 'Optimism',
    },
    {
      img: BNBLogo,
      title: 'BNB',
    },
  ],
  heroButtons: [
    {
      label: 'Launch Swapr',
      type: 'secondary',
      href: '#',
    },
    {
      label: 'Join Our Discord',
      type: 'dark',
      href: '#',
    },
  ],
} as const

export const RoutingThroughContent = {
  title: 'ROUTING THROUGH',
  companies: [
    {
      title: 'Uniswap',
      img: RoutingUniswap,
    },
    {
      title: 'SushiSwap',
      img: RoutingSushiSwap,
    },
    {
      title: 'BaoSwap',
      img: RoutingBaoSwap,
    },
    {
      title: 'HoneySwap',
      img: RoutingHoneySwap,
    },
    {
      title: 'Levinswap',
      img: RoutingLevinSwap,
    },
    { title: 'QuickSwap', img: RoutingQuickSwap },
    { title: 'DFYN', img: RoutingDFYN },
    {
      title: 'CoW',
      img: RoutingCoW,
    },
    {
      title: 'Curve',
      img: RoutingCurve,
    },
    {
      title: 'PancakeSwap',
      img: RoutingPancakeSwap,
    },
    {
      title: '1inch',
      img: RoutingOneInch,
    },
  ],
}

type Images = { [key: string]: string }

function importAll(folderArray: __WebpackModuleApi.RequireContext) {
  const images: Images = {}
  folderArray.keys().forEach(item => {
    const name = item.substring(item.indexOf('./') + 2, item.lastIndexOf('.'))
    images[name] = folderArray(item)
  })
  return images
}

const animations = importAll(require.context('./../assets/images/animations', false, /\.(svg)$/))

export type FeatureButton = {
  label: string
  type: 'primary' | 'dark'
  external: boolean
  onClick?: () => void
  href?: string
}

export type Feature = {
  title: string
  content: string
  image: string
  animation: string
  buttons: readonly FeatureButton[]
}

export type FeatureContent = {
  topBanner: {
    title: string
    logos: readonly string[]
  }
  preHeader: string
  sectionTitle: string
  features: readonly Feature[]
}

export const FeaturesContent: Readonly<FeatureContent> = {
  topBanner: {
    title: 'Swap, Farm, Bridge & Vote. DeFi unchained.',
    logos: [EthereumLogo, ArbitrumLogo, gnosisChainLogo, PolygonLogo, OptimismLogo, BNBLogo],
  },
  preHeader: 'Swapr Features',
  sectionTitle: 'Your DeFi Powertool',
  features: [
    {
      title: 'SWAP',
      content: 'Trade your favorite pairs on your favorite chains through the Swapr interface.',
      image: Swap,
      animation: animations['01_Swap'],
      buttons: [
        {
          label: 'SWAP',
          onClick: () => {
            scrollTo('app-wrapper')
          },
          type: 'primary',
          external: false,
        },
        {
          label: 'READ MORE',
          href: 'https://dxdocs.eth.limo/docs/Products/swapr/',
          type: 'dark',
          external: true,
        },
      ],
    },
    {
      title: 'ECO-ROUTING',
      content: 'The eco-router ensures the best price through established DEXes with no extra fees!',
      animation: animations['02_Eco_Routing'],
      image: EcoRouting,
      buttons: [
        {
          label: 'SWAP',
          onClick: () => {
            scrollTo('app-wrapper')
          },
          type: 'primary',
          external: false,
        },
        {
          label: 'READ MORE',
          href: 'https://dxdocs.eth.limo/docs/Products/swapr/',
          type: 'dark',
          external: true,
        },
      ],
    },
    {
      title: 'VOTE',
      content: 'LPs on the Swapr protocol can vote to adjust the fees on their pools.',
      image: Vote,
      animation: animations['03_Vote'],
      buttons: [
        {
          label: 'VOTE',
          href: 'https://snapshot.org/#/swpr.eth',
          type: 'primary',
          external: true,
        },
        {
          label: 'READ MORE',
          href: 'https://dxdocs.eth.limo/docs/Products/swapr/',
          type: 'dark',
          external: true,
        },
      ],
    },
    {
      title: 'FARMING',
      content: 'Users can participate in permissionless farming campaigns directly in the Swapr interface.',
      image: Farming,
      animation: animations['04_Farming'],
      buttons: [
        {
          label: 'FARM',
          href: '/#/rewards',
          type: 'primary',
          external: false,
        },
        {
          label: 'READ MORE',
          href: 'https://dxdocs.eth.limo/docs/Products/swapr/',
          type: 'dark',
          external: true,
        },
      ],
    },
    {
      title: 'DIY FARM',
      content: 'The Swapr protocol allows anyone to create farming campaigns. Any pair, any reward.',
      image: DiyFarm,
      animation: animations['05_DIY_Farm'],
      buttons: [
        {
          label: 'CREATE CAMPAIGN',
          href: '/#/liquidity-mining/create',
          type: 'primary',
          external: false,
        },
        {
          label: 'READ MORE',
          href: 'https://dxdocs.eth.limo/docs/Products/swapr/',
          type: 'dark',
          external: true,
        },
      ],
    },
    {
      title: 'BRIDGE',
      content: 'Bridge directly to or from multiple chains: Ethereum, Gnosis, Arbitrum, Polygon, Optimism.',
      image: Bridge,
      animation: animations['06_Bridge'],
      buttons: [
        {
          label: 'BRIDGE',
          href: '/#/bridge',
          type: 'primary',
          external: false,
        },
        {
          label: 'READ MORE',
          href: 'https://dxdocs.eth.limo/docs/Products/swapr/',
          type: 'dark',
          external: true,
        },
      ],
    },
  ],
} as const

export const CommunityLinksContent = {
  preHeader: 'Swapr Protocol',
  title: (
    <span>
      Join an unstoppable <br />
      community
    </span>
  ),
  links: [
    {
      image: Discord,
      alt: 'Discord Logo',
      title: 'Discord',
      content: 'Join in on community discussion on the Swapr Discord.',
      button: {
        label: 'JOIN DISCORD',
        href: 'https://discord.gg/QFkNsjTkzD',
      },
    },
    {
      image: Github,
      alt: 'GitHub Logo',
      title: 'GitHub',
      content: (
        <>
          Contribute to the <br />
          Swapr repositories on GitHub.
        </>
      ),
      button: {
        label: 'VISIT GITHUB',
        href: 'https://github.com/levelkdev/dxswap-dapp',
      },
    },
    {
      image: Twitter,
      alt: 'Twitter Logo',
      title: 'Twitter',
      content: 'Get the latest Swapr announcements on the Swapr Twitter.',
      button: {
        label: 'Follow on Twitter',
        href: 'https://twitter.com/SwaprEth',
      },
    },
  ],
} as const

export const BlogContent = {
  readBlogPost: 'READ BLOG POST',
  posts: [
    {
      image: EcoRouterArticle,
      title: 'The Eco Router — Effortlessly Combining Safety and Best Value Trading!',
      content: 'Introducing external liquidity into swapr with no extra cost to the user',
      postLink: 'https://medium.com/swapr/announcing-swpr-token-e8ab12dbad45',
    },
    {
      image: MevArticle,
      title: 'Full MEV Protection from CoW Protocol within Swapr’s Eco Router.',
      content: 'MEV Protection in Swapr',
      postLink:
        'https://medium.com/swapr/dxdao-and-badgerdao-leverage-swapr-to-bring-smarter-btc-focused-strategies-to-arbitrum-23689e0c9f2b',
    },
    {
      image: Entry2,
      title: 'Introducing SWPR Token Farming Rewards',
      content:
        'Introducing SWPR Token Farming RewardsRecently, the DXdao community identified a misconfiguration with ...',
      postLink: 'https://medium.com/swapr/introducing-swpr-token-farming-rewards-7fbdcc9507ae',
    },
  ],
} as const

export const FooterContent = {
  linkColumns: [
    {
      title: 'About',
      footerLinks: [
        {
          label: 'FAQ',
          href: 'https://dxdocs.eth.limo/docs/Products/swapr/faq/',
        },
        {
          label: 'Blog',
          href: 'https://medium.com/swapr',
        },
        {
          label: 'Audits',
          href: 'https://dxdocs.eth.limo/docs/Technical%20Documentation/Audits/#swapr',
        },
        {
          label: 'Brand Assets',
          href: 'https://dxdocs.eth.limo/docs/BrandingAssets/#swapr-brand-assets',
        },
      ],
    },
    {
      title: 'Community',
      footerLinks: [
        {
          label: 'Discord',
          href: 'https://discord.gg/QFkNsjTkzD',
        },
        {
          label: 'Twitter',
          href: 'https://twitter.com/SwaprEth',
        },
        {
          label: 'Keybase',
          href: 'https://keybase.io/team/dx_dao',
        },
        {
          label: 'Forum',
          href: 'https://daotalk.org/c/dx-dao/15',
        },
      ],
    },
    {
      title: 'Documentation',
      footerLinks: [
        {
          label: 'DIY Campaigns',
          href: 'https://dxdocs.eth.limo/docs/Products/swapr/DIY%20Liquidity%20Mining/',
        },
        {
          label: 'Roadmap',
          href: 'https://dxdocs.eth.limo/docs/Products/swapr/roadmap/',
        },
        {
          label: "We're hiring",
          href: 'https://dxdocs.eth.limo/docs/ContributorHub/open-positions-and-bounties/',
        },
        {
          label: 'SWPR Token',
          href: 'https://dxdocs.eth.limo/docs/Products/swapr/tokenomics/',
        },
      ],
    },
    {
      title: 'Analytics',
      footerLinks: [
        {
          label: 'DXstats',
          href: 'https://dxstats.eth.limo/#/home',
        },
      ],
    },
  ],
  footerCta: {
    label: 'GO TO SWAPR',
    href: '#',
  },
} as const

type Company = {
  name: string
  image: string
  href: string
}

type Status = {
  title: 'TOTAL VOLUME' | 'TRADES' | 'TOTAL FEES COLLECTED' | 'SWPR PRICE' | 'TVL' | 'ROUTING THROUGH'
  value?: JSX.Element
  externalSource?: boolean
  headingDollar?: boolean
  moreLabel?: string
  companies?: readonly Company[]
}

type StatusContent = {
  title: string
  stats: readonly Status[]
}

export const StatsContent: Readonly<StatusContent> = {
  title: 'Swapr Stats',
  stats: [
    {
      title: 'TOTAL VOLUME',
      value: <TextyAnim type="flash">$145,000,000+</TextyAnim>,
      externalSource: true,
    },
    {
      title: 'TRADES',
      value: (
        <>
          <TextyAnim type="flash">570,000+</TextyAnim>
        </>
      ),
      externalSource: true,
    },
    {
      title: 'TOTAL FEES COLLECTED',
      value: (
        <>
          <TextyAnim type="flash">$34,000+</TextyAnim>
          <TextyAnim type="flash" className="dim"></TextyAnim>
        </>
      ),
    },
    {
      title: 'SWPR PRICE',
      value: (
        <>
          <TextyAnim type="flash">$49</TextyAnim>
          <TextyAnim type="flash" className="dim">
            0
          </TextyAnim>
          <TextyAnim type="flash" className="hiddable-mobile">
            00
          </TextyAnim>
        </>
      ),
      externalSource: true,
      headingDollar: true,
    },
    {
      title: 'TVL',
      value: <TextyAnim>10,149,321</TextyAnim>,
      externalSource: true,
    },
    {
      title: 'ROUTING THROUGH',
      companies: [
        {
          name: 'UniSwap',
          image: UniSwapStats,
          href: '#',
        },
        {
          name: 'SushiSwap',
          image: SushiSwapStats,
          href: '#',
        },
        {
          name: 'BaoSwap',
          image: BaoSwapStats,
          href: '#',
        },
        {
          name: 'HoneySwap',
          image: HoneySwapStats,
          href: '#',
        },
      ],
      moreLabel: '+ 3 more',
    },
  ],
} as const
