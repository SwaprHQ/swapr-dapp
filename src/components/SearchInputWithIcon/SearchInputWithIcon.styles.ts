import styled from 'styled-components'
import transparentize from 'polished/lib/color/transparentize'
import border8pxRadius from '../../assets/images/border-8px-radius.png'

export const SearchExpandedInput = styled.input<{ fontWeight?: number; fontSize?: string }>`
  width: 62px;
  background: transparent;
  border: transparent;
  outline: none;
  color: ${({ theme }) => theme.text4};
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : 'normal')};
  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
  :focus::-webkit-input-placeholder {
    color: transparent;
  }
  :focus:-moz-placeholder {
    color: transparent;
  } /* Firefox 18- */
  :focus::-moz-placeholder {
    color: transparent;
  } /* Firefox 19+ */
  :focus:-ms-input-placeholder {
    color: transparent;
  } /* oldIE ;) */
`

export const SearchInputWrapper = styled.div<{ width?: string; height?: string }>`
  display: flex;
  justify-content: end;
  border-radius: 8px;
  padding: 8px 14px;
  justify-content: flex-end;
  align-items: center;
  white-space: nowrap;
  border-image: url(${border8pxRadius}) 8;
  background: ${({ theme }) => transparentize(0.75, theme.purpleBase)};
  width: ${({ width }) => (width ? width : '100%')};
  height: ${({ height }) => (height ? height : '44px')};
  outline: none;
  border: 1px solid ${({ theme }) => theme.bg5};
`
