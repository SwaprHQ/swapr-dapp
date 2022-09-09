import styled from 'styled-components'

import { SvgButton } from '../../Button'
import Column from '../../Column'

export const ContentWrapper = styled(Column)`
  width: 100%;
  border-radius: 12px;
  flex: 1;
  overflow: hidden;
  position: relative;
  align-items: center;
  /* background-color: ${({ theme }) => theme.dark2}; */
`

export const Footer = styled.div`
  width: 100%;
  /* border-radius: 8px; */
  padding: 16px;
  /* border-top-left-radius: 0; */
  /* border-top-right-radius: 0; */
  /* background-color: ${({ theme }) => theme.bg1And2}; */
  /* border-top: 1px solid ${({ theme }) => theme.bg1And2}; */
`

const SwaprV2SvgButton = styled(SvgButton)`
  display: flex;
  background: rgba(60, 56, 100, 0.1);
  border: 1px solid #2a2f42;
  border-radius: 50%;
  backdrop-filter: blur(10px);
  box-shadow: inset 0px 1.11185px 6.6711px rgba(165, 164, 255, 0.08),
    inset 6.6711px 2.2237px 11.1185px rgba(143, 141, 255, 0.1);
  cursor: pointer;
  color: #8780bf;

  svg {
    fill: currentColor;
    width: 14px;
    height: 14px;
  }
`

export const InputCloseButton = styled(SwaprV2SvgButton)`
  padding: 4px;
  position: absolute;
  right: 20px;
`

export const FooterButton = styled(SwaprV2SvgButton)`
  padding: 10px;
`
