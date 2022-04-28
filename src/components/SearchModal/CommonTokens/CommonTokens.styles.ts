import styled from 'styled-components'

export const BaseWrapper = styled.div<{ disabled?: boolean }>`
  border-radius: 12px;
  display: flex;
  line-height: 19.5px;
  padding: 6px 10px;
  margin-right: 8px;
  color: ${({ theme }) => theme.text1};
  align-items: center;
  transition: background-color 0.3s ease;
  :hover {
    cursor: ${({ disabled }) => !disabled && 'pointer'};
    background-color: ${({ disabled }) => !disabled && '#555a73'};
  }

  color: ${({ theme, disabled }) => disabled && theme.text3};
  background-color: ${({ theme }) => theme.bg3};
  opacity: ${({ disabled }) => disabled && '0.5'};
`
