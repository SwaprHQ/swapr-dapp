import { Connector } from '@web3-react/types'
import { getConnection } from 'connectors/utils'
import React from 'react'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'

import { SUPPORTED_WALLETS } from '../../constants'
import { TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import Loader from '../Loader'

const PendingSection = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  border: solid 1px ${({ theme }) => theme.text5};
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  padding: 20px;
  width: 100%;
  & > * {
    width: 100%;
  }
`

const StyledLoader = styled(Loader)`
  margin-right: 1rem;
  path {
    stroke: ${({ theme }) => theme.text5};
  }
`

const LoadingMessage = styled.div<{ error?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap};
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  color: ${({ theme, error }) => (error ? theme.red1 : theme.text1)};
`

const ErrorGroup = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  flex-direction: column;
  justify-content: center;
`

const LoadingWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
  width: 100%;
`

export default function PendingView({
  connector,
  error = false,
  tryActivation,
}: {
  connector: Connector
  error?: boolean
  tryActivation: (connector: Connector) => void
}) {
  const { name, logo } = SUPPORTED_WALLETS[getConnection(connector).type]

  return (
    <PendingSection>
      <Flex mb="28px" justifyContent="center">
        <Box mr="10px">
          <img
            // eslint-disable-next-line
            src={logo}
            alt="logo"
            width="24px"
            height="24px"
          />
        </Box>
        <Box>
          <TYPE.body color="white" fontWeight="500" fontSize="22px" lineHeight="27px">
            {name}
          </TYPE.body>
        </Box>
      </Flex>

      <LoadingMessage error={error}>
        <LoadingWrapper>
          {error ? (
            <ErrorGroup>
              <TYPE.body
                color="red1"
                fontWeight="500"
                fontSize="20px"
                lineHeight="24px"
                letterSpacing="-0.01em"
                marginBottom="24px"
              >
                Error connecting.
              </TYPE.body>
              <ButtonPrimary
                padding="8px 14px"
                onClick={() => {
                  connector && tryActivation(connector)
                }}
              >
                Try Again
              </ButtonPrimary>
            </ErrorGroup>
          ) : (
            <>
              <StyledLoader />
              <TYPE.body color="text4" fontWeight="500" fontSize="20px" lineHeight="24px" letterSpacing="-0.01em">
                Initializing...
              </TYPE.body>
            </>
          )}
        </LoadingWrapper>
      </LoadingMessage>
    </PendingSection>
  )
}
