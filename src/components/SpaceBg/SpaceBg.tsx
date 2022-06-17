import React, { FC } from 'react'
import styled, { keyframes } from 'styled-components'

import HeroImage from '../../assets/images/hero-graphic-desktop.png'
import HeroImageLeft from '../../assets/images/hero-graphic-left.png'
import { breakpoints, gradients } from '../../utils/theme'

export const SpaceBg: FC = ({ children }) => (
  <StyledHero id="liquidity-hero" className="hero-active">
    <div className="inner-hero">
      <AppBodyContainer>{children}</AppBodyContainer>
      <div className="hero-background">
        <div className="hero-image hero-image-right"></div>
        <div className="hero-image hero-image-left"></div>
      </div>
    </div>
  </StyledHero>
)

const AppBodyContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
  min-height: calc(100vh - 340px);
`

const zoomOut = keyframes`
    0% {transform: scale(1.2); opacity: 0;}
    100% {transform: scale(1); opacity: 0.7;}
`

const StyledHero = styled.div`
    position: relative;
    width: 100%;
    .inner-hero {
        display: flex;
        flex-direction: column;
        min-height: calc(100vh - 240px);
        width: 100%;
    }
    &:not(.hero-active) {
        .hero-image-left,
        .hero-image-right {
            opacity: 0;
        }
        .hero-image-right {
            transform: translateY(-100px);
        }
        .hero-image-left {
            transform: translateY(-30px);
        }
    }
    .hero-content {
        padding: 0 144px;
        margin-top: 80px;
        position: relative;
        z-index: 4;
        h1 {
            width: 665px;
            span {
                font-size: 61px;
                font-weight: 600;
                background: ${gradients.heroMainText};
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                line-height: 74px;
                br {
                    display: none;
                }
            }
        }
        .hero-logos-list {
            margin-top: 65px;
            display: flex;
            align-items: center;
            position: relative;
            z-index: 3;
            .hero-logo-group {
                display: flex;
                align-items: center;
                li {
                    margin-right: 31px;
                    opacity: 0.7;
                }
            }
        }
        .hero-button-list {
            display: flex;
            margin-top: 65px;
            li {
                margin-right: 40px;
            }
        }
    }
    .hero-background {
        animation: ${zoomOut} 500ms 1750ms ease-out forwards;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        z-index: 2;
    }
    .hero-image-left,
    .hero-image-right {
        position: absolute;
        pointer-events: none;
        background-repeat: no-repeat;
        background-position: right;
        transition: 1s ease-in-out all;
        /* transition: 0.25s ease-in-out transform; */
    }
    .hero-image-right {
        background-image: url('${HeroImage}');
        width: 1198px;
        height: 905px;
        top: -172px;
        right: -32px;
        z-index: 1;
    }
    .hero-image-left {
        background-image: url('${HeroImageLeft}');
        width: 1680px;
        height: 1680px;
        top: -172px;
        right: -15px;
        background-position: left top;
        background-size: 100% auto;
        z-index: 1;
        @media screen and (min-width: 1680px) {
            width: 102%;
        }
    }
    
    @media screen and (max-width: ${breakpoints.md}) {
        .inner-hero {
            min-height: calc(100vh + 80px);;
        }
        .hero-content {
            margin-top: 42px;
            padding: 0px;
            h1 {
                /* max-width: 303px; */
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
    @media not all and (min-resolution:.001dpcm)
    { @supports (-webkit-appearance:none) {
        .hero-content {
            h1 {
                color: #DFDCFD !important;
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
    }}
`
