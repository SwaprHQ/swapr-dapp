import styled from 'styled-components'

export const BaseWrapper = styled.div<{ disable?: boolean }>`
  border-radius: 12px;
  display: flex;
  line-height: 19.5px;
  padding: 6px 10px;
  margin-right: 8px;
  color: ${({ theme }) => theme.text1};
  align-items: center;
  transition: background-color 0.3s ease;
  :hover {
    cursor: ${({ disable }) => !disable && 'pointer'};
    background-color: ${({ disable }) => !disable && '#555a73'};
  }

  color: ${({ theme, disable }) => disable && theme.text3};
  background-color: ${({ theme }) => theme.bg3};
  opacity: ${({ disable }) => disable && '0.5'};
`
