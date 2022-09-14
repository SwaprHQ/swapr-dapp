import { Flex } from 'rebass'
import styled from 'styled-components'

export const ButtonGroup = styled(Flex)`
  background: ${({ theme }) => theme.dark1};
  border-radius: 12px;
  padding: 3px;
  > * {
    margin-right: 3px;
  }
`

export const ButtonGroupOption = styled.button<{
  active?: boolean
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: fit-content;
  padding: 8px;

  background: ${({ active, theme }) => (active ? theme.dark2 : theme.dark1)};
  border: 0;
  border-radius: 10px;

  font-size: 8px;
  font-weight: 600;
  color: ${({ active, theme }) => (active ? 'white' : theme.purple5)};
  text-transform: uppercase;

  cursor: pointer;

  &:last-child {
    margin: 0;
  }

  &:hover {
    color: ${({ theme }) => theme.text3};
    background: ${({ theme }) => theme.dark2};
  }

  &:disabled {
    pointer-events: none;
    color: ${({ theme }) => theme.dark2};
    background: ${({ theme }) => theme.dark1};
  }
`
