import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

import { ReactComponent as BALLogoSVG } from '../../../assets/swapbox/token-logo-bal.svg'
import { ReactComponent as BATLogoSVG } from '../../../assets/swapbox/token-logo-bat.svg'
import { ReactComponent as DAILogoSVG } from '../../../assets/swapbox/token-logo-dai.svg'
import { ReactComponent as DXDLogoSVG } from '../../../assets/swapbox/token-logo-dxd.svg'
import { ReactComponent as ETHLogoSVG } from '../../../assets/swapbox/token-logo-eth.svg'
import { ReactComponent as SWPRLogoSVG } from '../../../assets/swapbox/token-logo-swpr.svg'
import { ReactComponent as USDCLogoSVG } from '../../../assets/swapbox/token-logo-usdc.svg'
import { ReactComponent as USDTLogoSVG } from '../../../assets/swapbox/token-logo-usdt.svg'

type TokenPickerProps = {
  closeTokenPicker: () => void
}

export function TokenPicker({ closeTokenPicker }: TokenPickerProps) {
  const [tokenPickerContainer] = useState(() => document.createElement('div'))

  useEffect(() => {
    tokenPickerContainer.classList.add('token-picker-root')
    document.body.appendChild(tokenPickerContainer)

    return () => {
      document.body.removeChild(tokenPickerContainer)
    }
  }, [tokenPickerContainer])

  const onClose = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      event.stopPropagation()
      closeTokenPicker()
    }
  }

  return createPortal(
    <Container
      onClick={onClose}
      initial={{ opacity: 0, scale: 2 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.2,
        },
      }}
      exit={{
        opacity: 0,
        scale: 2,
        transition: {
          duration: 0.1,
        },
      }}
    >
      <Input placeholder="Search token by name or paste address" spellCheck={false} />
      <TokensSection>
        <Heading>Your Balance</Heading>
        <TokenItems>
          <TokenItem>
            <ETHLogoSVG />
            ETH
          </TokenItem>
          <TokenItem>
            <USDCLogoSVG />
            USDC
          </TokenItem>
          <TokenItem>
            <DXDLogoSVG /> DXD
          </TokenItem>
          <TokenItem>
            <DAILogoSVG /> DAI
          </TokenItem>
          <TokenItem>
            <SWPRLogoSVG /> SWPR
          </TokenItem>
          <TokenItem>+11</TokenItem>
        </TokenItems>
      </TokensSection>
      <TokensSection>
        <Heading>Common Tokens</Heading>
        <TokenItems>
          <TokenItem>
            <ETHLogoSVG />
            ETH
          </TokenItem>
          <TokenItem>
            <USDCLogoSVG />
            USDC
          </TokenItem>
          <TokenItem>
            <DXDLogoSVG /> DXD
          </TokenItem>
          <TokenItem>
            <SWPRLogoSVG /> SWPR
          </TokenItem>
          <TokenItem>
            <ETHLogoSVG />
            DAI
          </TokenItem>
          <TokenItem>
            <BALLogoSVG />
            BAL
          </TokenItem>
          <TokenItem>
            <USDTLogoSVG /> USDT
          </TokenItem>
          <TokenItem>
            <BATLogoSVG /> BAT
          </TokenItem>
        </TokenItems>
      </TokensSection>
    </Container>,
    tokenPickerContainer
  )
}

const Container = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(7px);
`

const Input = styled.input`
  width: 478px;
  height: 48px;
  box-sizing: border-box;
  background: rgba(20, 18, 31, 0.5);
  border-radius: 12px;
  border: 2px solid #8c83c0;
  outline: none;
  line-height: 14px;
  font-size: 16px;
  font-family: Inter;
  font-weight: 500;
  color: #dddaf8;
  text-shadow: 0px 0px 10px rgba(255, 255, 255, 0.15);
  padding: 15px 20px;
  backdrop-filter: blur(12.5px);
  margin: 220px auto 74px;
`

const TokensSection = styled.div`
  width: 478px;
  text-align: center;
  margin-bottom: 34px;
`

const Heading = styled.h1`
  height: 12px;
  line-height: 12px;
  display: inline-block;
  font-size: 10px;
  font-family: Montserrat, Inter;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #bcb3f0;
  margin-bottom: 16px;
`

const TokenItems = styled.div`
  display: flex;
  flex: 1 0 auto;
  justify-content: center;
  align-items: center;
  gap: 8px;
`

const TokenItem = styled.button`
  height: 38px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid #464366;
  padding: 10px 14px;
  line-height: 18px;
  font-size: 14px;
  font-family: Inter;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #bcb3f0;
  background: linear-gradient(143.3deg, rgba(46, 23, 242, 0.5) -185.11%, rgba(46, 23, 242, 0) 49.63%),
    rgba(57, 51, 88, 0.3);
  background-blend-mode: normal, overlay, normal;
  backdrop-filter: blur(12.5px);

  cursor: pointer;
`
