import { DISCORD_INVITE_LINK } from '../constants'

import BNBLogo from './../assets/images/BNBLogo.svg'
import ArbitrumLogo from './../assets/images/logo-Arbitrum.svg'
import EthereumLogo from './../assets/images/logo-Ethereum.svg'
import PolygonLogo from './../assets/images/logo-Polygon.svg'
import xDaiLogo from './../assets/images/logo-xDai.svg'
import OptimismLogo from './../assets/images/optimism.svg'
import RoutingOneInch from './../assets/images/routing-1inch.svg'
import RoutingBaoSwap from './../assets/images/routing-BaoSwap.svg'
import RoutingBiSwap from './../assets/images/routing-Biswap.svg'
import RoutingCoW from './../assets/images/routing-CoW.svg'
import RoutingCurve from './../assets/images/routing-Curve.svg'
import RoutingDFYN from './../assets/images/routing-DFYN.svg'
import RoutingHoneySwap from './../assets/images/routing-HoneySwap.svg'
import RoutingLevinSwap from './../assets/images/routing-Levinswap.svg'
import RoutingLifi from './../assets/images/routing-Lifi.svg'
import RoutingPancakeSwap from './../assets/images/routing-Pancakeswap.svg'
import RoutingQuickSwap from './../assets/images/routing-Quickswap.svg'
import RoutingSushiSwap from './../assets/images/routing-SushiSwap.svg'
import RoutingUniswap from './../assets/images/routing-Uniswap.svg'
import RoutingVelodrome from './../assets/images/routing-Velodrome.svg'
import RoutingZerox from './../assets/images/routing-Zerox.svg'

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
  mainText: <span>Swap, Bridge, Farm across chains.</span>,
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
      href: DISCORD_INVITE_LINK,
    },
  ],
} as const

export const RoutingThroughContent = {
  title: 'ROUTING THROUGH',
  companies: [
    {
      title: '0x',
      img: RoutingZerox,
    },
    {
      title: '1inch',
      img: RoutingOneInch,
    },
    {
      title: 'BaoSwap',
      img: RoutingBaoSwap,
    },
    {
      title: 'BiSwap',
      img: RoutingBiSwap,
    },
    {
      title: 'CoW',
      img: RoutingCoW,
    },
    {
      title: 'Curve',
      img: RoutingCurve,
    },
    { title: 'DFYN', img: RoutingDFYN },
    {
      title: 'HoneySwap',
      img: RoutingHoneySwap,
    },
    {
      title: 'Levinswap',
      img: RoutingLevinSwap,
    },
    {
      title: 'PancakeSwap',
      img: RoutingPancakeSwap,
    },
    { title: 'QuickSwap', img: RoutingQuickSwap },
    {
      title: 'SushiSwap',
      img: RoutingSushiSwap,
    },
    {
      title: 'Uniswap',
      img: RoutingUniswap,
    },
    {
      title: 'Velodrome',
      img: RoutingVelodrome,
    },
    {
      title: 'Lifi',
      img: RoutingLifi,
    },
  ],
}

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
          href: DISCORD_INVITE_LINK,
        },
        {
          label: 'X',
          href: 'https://x.com/Swapr_dapp',
        },
        {
          label: 'Forum',
          href: 'https://daotalk.org/c/dx-dao/15',
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
