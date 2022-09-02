import React, { ReactNode } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'

export const ButtonGroupOption = styled.div<{ active?: boolean; first?: boolean; last?: boolean }>`
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
  border-radius: ${({ first, last }) => (first ? '8px 0px 0px 8px' : last ? '0 8px 8px 0' : '0')};

  &:hover {
    color: ${({ theme }) => theme.text4};
    background: rgba(104, 110, 148, 0.25);
  }
`

export const ButtonGroup = ({ children }: { children: ReactNode }) => {
  const childrenWithProps = React.Children.map(children, (child, index) => {
    let props = {
      last: false,
      first: false,
    }
    if (React.Children.count(children) === index + 1) props.last = true
    if (index === 0) props.first = true
    if (React.isValidElement(child)) {
      return React.cloneElement(child, props)
    }
    return child
  })

  return <Flex>{childrenWithProps}</Flex>
}
