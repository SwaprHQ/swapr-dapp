import { Web3ReactHooks } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { getIsMetaMask } from 'connectors/utils'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { SUPPORTED_WALLETS, WalletType } from '../../constants'
import { StyledConnectedIcon } from '../../utils'
import { Connection } from './../../connectors'

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
  id: WalletType
  connector: Connector
  tryActivation: (connector: Connector) => void
  isActive: boolean
  isInstalledWallet: boolean
}

export const WalletOption = ({ id, connector, isActive, isInstalledWallet, tryActivation }: OptionProps) => {
  const { logo, link, name } = SUPPORTED_WALLETS[id]

  const getContent = () => (
    <>
      <ListIconWrapper isActive={isActive}>
        {isActive && <StyledConnectedIcon width="50px" padding="0 0 0 12px" />}
        <img src={logo} alt={name + ' logo'} />
      </ListIconWrapper>
      {name}
    </>
  )

  return (
    <ListItem id={name}>
      {!isInstalledWallet && link ? (
        <ListButton as="a" href={link} target="_blank" rel="noopener noreferrer">
          {getContent()}
        </ListButton>
      ) : (
        <ListButton
          onClick={() => {
            console.log('aaa!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
            tryActivation(connector)
          }}
        >
          {getContent()}
        </ListButton>
      )}
    </ListItem>
  )
}
