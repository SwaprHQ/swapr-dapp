import { css } from 'styled-components'

export const SwaprV2AssetMixin = css<{ disabled?: boolean }>`
  color: #c0baf7;
  transition: background-color 0.3s ease;
  background-color: rgba(60, 56, 100, 0.1);
  box-shadow: inset 0px 1px 7px rgba(165, 164, 255, 0.08), inset 7px 2px 11px rgba(143, 141, 255, 0.1);
  backdrop-filter: blur(10px);
  opacity: ${({ disabled }) => disabled && '0.5'};
  :hover {
    cursor: ${({ disabled }) => !disabled && 'pointer'};
    background-color: ${({ disabled }) => !disabled && 'rgba(60, 56, 100, 0.7)'};
  }
`
