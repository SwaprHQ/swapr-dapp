import React, { ReactNode } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'

export const ButtonGroupOption = styled.button<{
  active?: boolean
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  height: fit-content;
  font-size: 10px;
  font-weight: 600;
  color: ${({ active }) => (active ? '#EBE9F8' : '#464366')};

  cursor: pointer;

  background: ${({ active }) => (active ? 'rgba(104, 110, 148, 0.25)' : 'rgba(62, 65, 87, 0.2)')};
  border: 1px solid #2c2b42;

  &:first-child {
    border-radius: 8px 0px 0px 8px;
  }

  &:last-child {
    border-radius: 0 8px 8px 0;
  }

  &:hover {
    color: ${({ theme }) => theme.text4};
    background: rgba(104, 110, 148, 0.25);
  }

  &:disabled {
    cursor: not-allowed;
    color: ${({ theme }) => theme.text6};
    background: rgba(104, 110, 148, 0.1);
  }
`

export const ButtonGroup = ({ children }: { children: ReactNode }) => {
  return <Flex>{children}</Flex>
}
