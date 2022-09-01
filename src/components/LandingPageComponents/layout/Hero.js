import { Fragment, useEffect, useState } from 'react'
import Marquee from 'react-fast-marquee'
import styled, { keyframes } from 'styled-components'

import { breakpoints } from '../../../utils/theme'
import Arrow from './../../../assets/images/arrow-down-hero.svg'
import { HeroContent, RoutingThroughContent } from './../../../utils/ui-constants'
import Button from './../common/Button'
import Layout from './Layout'

const arrowIndicatorAnimation = keyframes`
  0% {opacity: 1}
  10% {opacity: 0.3}
  20% {opacity: 1}
  100% {opacity: 1}
`

const ArrowIndicator = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 46px;
  .arrow {
    width: 12px;
    height: 5px;
    margin-bottom: 2px;
    background-image: url('${Arrow}');
    background-size: contain;
    bakground-position: center;
    animation: ${arrowIndicatorAnimation} infinite;
    animation-duration: 3s;
    background-repeat: no-repeat;
    &:nth-child(2) {
      animation-delay: 0.4s;
    }
    &:nth-child(3) {
      animation-delay: 0.8s;
    }
  }
`

const RoutingThroughImage = styled.img`
  height: 20px;
`

const Hero = props => {
  const [isHeroActive, setIsHeroActive] = useState(true)
  const [logosArrays, setLogosArrays] = useState([])
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px 0px 0px 0px',
      threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    }

    const callback = entries => {
      entries.forEach(entry => {
        const elementHeight = entry.boundingClientRect.height
        const pixelsShown = entry.boundingClientRect.top < 0 ? -entry.boundingClientRect.top : 0
        const showElement = pixelsShown < elementHeight / 4
        setIsHeroActive(showElement)
      })
    }

    const observer = new IntersectionObserver(callback, options)

    const target = document.querySelector('#index-hero')
    observer.observe(target)
  }, [])

  useEffect(() => {
    let i,
      j,
      temporary,
      chunk = 2
    const temporaryArray = []
    for (i = 0, j = HeroContent.heroLogos.length; i < j; i += chunk) {
      temporary = HeroContent.heroLogos.slice(i, i + chunk)
      temporaryArray.push(temporary)
    }
    setLogosArrays(temporaryArray)
  }, [])

  return (
    <StyledHero id={'index-hero'} className={isHeroActive ? 'hero-active' : ''}>
      <Layout width="main-width" className={'inner-hero'}>
        {HeroContent ? (
          props.children
        ) : (
          <div className="hero-content" data-aos="fade-up">
            <h1>{HeroContent.mainText}</h1>
            <ul className="hero-logos-list">
              {logosArrays.map((item, key) => (
                <div key={key + '-hero'} className="hero-logo-group">
                  {item.map((logo, key) => (
                    <li key={`${logo.title}-${key}`}>
                      <img src={logo.img} title={logo.title} alt="Logos" />
                    </li>
                  ))}
                </div>
              ))}
            </ul>
            <ul className="hero-button-list">
              {HeroContent.heroButtons.map((button, key) => (
                <li key={`${button.label}-${key}`}>
                  <Button type={button.type} label={button.label} to={button.href} />
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="routing-through desktop" data-aos="fade-up">
          <div className="routing-through-header">
            <div className="left-line"></div>
            <div className="label">{RoutingThroughContent.title}</div>
            <div className="right-line"></div>
          </div>
          <div className="routing-through-body">
            <Marquee speed={50} gradientColor={[12, 11, 18]}>
              <div className="marquee-inner">
                {[...Array(3)].map((_, index) => (
                  <Fragment key={index}>
                    {RoutingThroughContent.companies.map((company, key) => (
                      <RoutingThroughImage
                        key={`${key}-${company.title}`}
                        src={company.img}
                        alt={`Routing through...`}
                      />
                    ))}
                  </Fragment>
                ))}
              </div>
            </Marquee>
          </div>
        </div>
        <ArrowIndicator>
          <div className="arrow" />
          <div className="arrow" />
          <div className="arrow" />
        </ArrowIndicator>
        <div className="routing-through mobile" data-aos="fade-up">
          <div className="routing-through-header">
            <div className="left-line"></div>
            <div className="label">{RoutingThroughContent.title}</div>
            <div className="right-line"></div>
          </div>
          <div className="routing-through-body">
            <Marquee speed={50} gradientColor={[12, 11, 18]}>
              <div className="marquee-inner">
                {RoutingThroughContent.companies.map((company, key) => (
                  <RoutingThroughImage key={key} src={company.img} alt="Routing through..." />
                ))}
                {RoutingThroughContent.companies.map((company, key) => (
                  <RoutingThroughImage key={key + '-copy'} src={company.img} alt="Routing through..." />
                ))}
              </div>
            </Marquee>
          </div>
        </div>
      </Layout>
    </StyledHero>
  )
}

const StyledHero = styled(Layout)`
  .routing-through {
    margin-top: auto;
    margin-left: -16px;
    margin-right: -16px;
    position: relative;
    z-index: 0;
    &.mobile {
      display: none;
    }
    .routing-through-header {
      height: 28px;
      display: flex;
      align-items: center;
      letter-spacing: 1px;
      .left-line,
      .right-line {
        position: relative;
        height: 100%;
        flex-grow: 1;
        &:after {
          content: '';
          position: absolute;
          width: 100%;
          bottom: 14px;
          height: 1px;
          background: linear-gradient(90deg, rgba(135, 128, 191, 0) 0%, #8780bf 51.04%, rgba(135, 128, 191, 0) 100%);
        }
      }
      .label {
        color: rgba(135, 128, 191, 1);
        margin: 0 10px;
      }
    }
    .routing-through-body {
      position: relative;
      &:after {
        content: '';
        position: absolute;
        width: 100%;
        bottom: -14px;
        height: 1px;
        background: linear-gradient(90deg, rgba(135, 128, 191, 0) 0%, #8780bf 51.04%, rgba(135, 128, 191, 0) 100%);
      }
      .marquee {
        min-width: unset;
        .marquee-inner {
          padding: 18px 0;
          img {
            margin: 0 25px;
          }
        }
      }
    }
  }
  @media screen and (max-width: ${breakpoints.md}) {
    .inner-hero {
      min-height: calc(100vh + 80px);
    }
    .hero-content {
      margin-top: 42px;
      padding: 0px;
      h1 {
        span {
          font-size: 48px;
          line-height: 54px;
          font-weight: 500;
        }
      }
      .hero-logos-list {
        flex-wrap: wrap;
        margin-right: 30px;
        margin-top: 48px;
        flex-direction: column;
        align-items: flex-start;
        li {
          margin-bottom: 30px;
          img {
            max-width: 107px;
            max-height: 64px;
          }
        }
      }
      .hero-button-list {
        flex-wrap: wrap;
        margin-top: 10px;
        li {
          margin-bottom: 16px;
          .button {
            a {
              width: 163px;
              font-size: 10px;
              padding: 0;
              &,
              & .label {
                height: 36px;
                line-height: 36px;
              }
            }
          }
        }
      }
    }
    .routing-through {
      &.desktop {
        display: none;
      }
      &.mobile {
        display: unset;
      }
      .routing-through-header {
        .label {
          font-size: 12px;
        }
        .left-line {
          display: none;
        }
      }
      .routing-through-body {
        .marquee {
          .marquee-inner {
            img {
              margin: 0 18px;
            }
          }
        }
      }
    }
    .hero-image-right {
      width: 1198px;
      height: 905px;
      top: -422px;
      right: -340px;
      z-index: 1;
      opacity: 0.7;
      transform: scale(0.8) !important;
    }
    .hero-image-left {
      display: none;
    }
  }
  @media screen and (max-width: ${breakpoints.s}) {
    padding-bottom: 46px;
    .hero-content {
      h1 {
        max-width: 80%;
        span {
          font-size: 39px;
          line-height: 46.8px;
          font-weight: 500;
          br {
            /* display: unset; */
          }
        }
      }
    }
  }
  @media screen and (max-width: 460px) {
    .hero-content {
      h1 {
        br {
          display: unset;
        }
      }
    }
  }
  @media not all and (min-resolution: 0.001dpcm) {
    @supports (-webkit-appearance: none) {
      .hero-content {
        h1 {
          color: #dfdcfd !important;
          span {
            background: unset;
            -webkit-background-clip: unset;
            -webkit-text-fill-color: unset;
            br {
              display: none;
            }
          }
        }
      }
    }
  }
`

export default Hero
