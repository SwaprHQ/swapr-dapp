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
