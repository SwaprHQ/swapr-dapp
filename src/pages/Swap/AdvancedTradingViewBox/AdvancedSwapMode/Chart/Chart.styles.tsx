import styled from 'styled-components'

export const Wrapper = styled.div`
  position: relative;
  widht: 100%;
  height: 100%;
`

export const AbsoluteWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1;
  background: ${({ theme }) => theme.bg9};
`

export const DexScreenerIframe = styled.div`
  position: relative;
  width: 100%;
  height: 106.5%;
  user-select: none;

  iframe {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    border: 0;
  }
`
