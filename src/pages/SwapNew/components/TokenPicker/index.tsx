import { motion } from 'framer-motion'
import { ChangeEvent, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

import { ReactComponent as BALLogoSVG } from '../../../../assets/swapbox/token-logo-bal.svg'
import { ReactComponent as BATLogoSVG } from '../../../../assets/swapbox/token-logo-bat.svg'
import { ReactComponent as DAILogoSVG } from '../../../../assets/swapbox/token-logo-dai.svg'
import { ReactComponent as DXDLogoSVG } from '../../../../assets/swapbox/token-logo-dxd.svg'
import { ReactComponent as ETHLogoSVG } from '../../../../assets/swapbox/token-logo-eth.svg'
import { ReactComponent as SWPRLogoSVG } from '../../../../assets/swapbox/token-logo-swpr.svg'
import { ReactComponent as USDCLogoSVG } from '../../../../assets/swapbox/token-logo-usdc.svg'
import { ReactComponent as USDTLogoSVG } from '../../../../assets/swapbox/token-logo-usdt.svg'
import { CurrencySymbol } from '../../constants'
import { TokenItem } from './TokenItem'

type TokenPickerProps = {
  tokenPickerInput: string
  onTokenPickerInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  closeTokenPicker: () => void
}

export function TokenPicker({ tokenPickerInput, onTokenPickerInputChange, closeTokenPicker }: TokenPickerProps) {
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
      <Input
        value={tokenPickerInput}
        onChange={onTokenPickerInputChange}
        placeholder="Search token by name or paste address"
        spellCheck={false}
      />
      {!tokenPickerInput.trim() ? (
        <>
          <TokensSection>
            <Heading>Your Balance</Heading>
            <TokenItems>
              <TokenItem currencySymbol={CurrencySymbol.ETH} />
              <TokenItem currencySymbol={CurrencySymbol.BAL} />
              <TokenItem currencySymbol={CurrencySymbol.DAI} />
              <TokenItem currencySymbol={CurrencySymbol.DXD} />
              <TokenItem currencySymbol={CurrencySymbol.USDC} />
              <TokenItem currencySymbol={CurrencySymbol.USDT} />
              {/* <TokenItem>+11</TokenItem> */}
            </TokenItems>
          </TokensSection>
          <TokensSection>
            <Heading>Common Tokens</Heading>
            <TokenItems>
              <TokenItem currencySymbol={CurrencySymbol.SWPR} />
              <TokenItem currencySymbol={CurrencySymbol.ETH} />
              <TokenItem currencySymbol={CurrencySymbol.BAL} />
              <TokenItem currencySymbol={CurrencySymbol.BAT} />
              <TokenItem currencySymbol={CurrencySymbol.SWPR} />
            </TokenItems>
          </TokensSection>
        </>
      ) : (
        <SearchList>
          <SearchTokenItem>
            <SearchTokenInfo>
              <SearchTokenCurrencyInfo>
                <ETHLogoSVG />
                <SearchTokenCurrencySymbol>ETH</SearchTokenCurrencySymbol>
              </SearchTokenCurrencyInfo>
              <SearchTokenCurrencyBalance>0.4130</SearchTokenCurrencyBalance>
            </SearchTokenInfo>
            <SearchTokenName>Ether</SearchTokenName>
          </SearchTokenItem>
          <SearchTokenItem>
            <SearchTokenInfo>
              <SearchTokenCurrencyInfo>
                <ETHLogoSVG />
                <SearchTokenCurrencySymbol>ETH</SearchTokenCurrencySymbol>
              </SearchTokenCurrencyInfo>
              <SearchTokenCurrencyBalance>0.4130</SearchTokenCurrencyBalance>
            </SearchTokenInfo>
            <SearchTokenName>Ether</SearchTokenName>
          </SearchTokenItem>
          <SearchTokenItem>
            <SearchTokenInfo>
              <SearchTokenCurrencyInfo>
                <ETHLogoSVG />
                <SearchTokenCurrencySymbol>ETH</SearchTokenCurrencySymbol>
              </SearchTokenCurrencyInfo>
              <SearchTokenCurrencyBalance>0.4130</SearchTokenCurrencyBalance>
            </SearchTokenInfo>
            <SearchTokenName>Ether</SearchTokenName>
          </SearchTokenItem>
        </SearchList>
      )}
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

const SearchList = styled.div`
  max-width: 478px;
  width: 100%;
`

const SearchTokenItem = styled.div`
  margin-bottom: 16px;
`

const SearchTokenInfo = styled.div`
  height: 20px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`

const SearchTokenCurrencyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const SearchTokenCurrencySymbol = styled.p`
  display: inline-block;
`

const SearchTokenCurrencyBalance = styled.p`
  display: inline-block;
  line-height: 18px;
  font-size: 15px;
  font-family: Inter;
  font-weight: 500;
  text-align: right;
  text-transform: uppercase;
  font-feature-settings: 'zero' on;
  color: #bcb3f0;
`

const SearchTokenName = styled.p`
  line-height: 12px;
  font-size: 10px;
  font-family: Inter;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-align: left;
  text-transform: uppercase;
  color: #dddaf8;
  opacity: 0.8;
`
