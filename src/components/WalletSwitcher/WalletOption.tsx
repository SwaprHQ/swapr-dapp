import { Connector } from '@web3-react/types'
import React from 'react'
import styled from 'styled-components'

import { getIsInjected } from '../../connectors/utils'
import { ConnectorType, SUPPORTED_WALLETS } from '../../constants'
import { StyledConnectedIcon } from '../../utils'

const ListIconWrapper = styled.div<{ isActive?: boolean }>`
  display: inline-flex;
  justify-content: space-evenly;
  align-items: center;
  width: 20px;
  height: 20px;
  margin-right: ${props => (props.isActive ? '34px' : '8px')};

  img {
    max-width: 100%;
  }
`

const ListItem = styled.li`
  & + & {
    margin-top: 20px;
    margin-bottom: 20px;
  }
`

const ListButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0;
  font-weight: 700;
  font-size: 12px;
  line-height: 15px;
  text-align: center;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  color: ${({ theme }) => theme.text2};
  background: none;
  border: 0;
  outline: none;
  cursor: pointer;
  padding: 0 22px;

  &:disabled {
    cursor: not-allowed;
    filter: grayscale(90%);
    opacity: 0.6;
  }
`

interface OptionProps {
  id: ConnectorType
  connector: Connector
  tryActivation: (connector: Connector) => void
  isActive: boolean
  isWalletDetected?: boolean
}

export const WalletOption = ({ id, connector, isActive, isWalletDetected, tryActivation }: OptionProps) => {
  const { logo, link, name } = SUPPORTED_WALLETS[id]

  if (!isWalletDetected && link) {
    return (
      <ListItem id={name}>
        <ListButton as="a" href={link} target="_blank" rel="noopener noreferrer">
          <ListIconWrapper isActive={isActive}>
            <img src={logo} alt={name + ' logo'} />
          </ListIconWrapper>
          INSTALL {name}
        </ListButton>
      </ListItem>
    )
  }

  return (
    <ListItem id={name}>
      <ListButton
        onClick={() => {
          tryActivation(connector)
        }}
      >
        <ListIconWrapper isActive={isActive}>
          {isActive && <StyledConnectedIcon width="50px" padding="0 0 0 12px" />}
          <img src={logo} alt={name + ' logo'} />
        </ListIconWrapper>
        {name}
      </ListButton>
    </ListItem>
  )
}
