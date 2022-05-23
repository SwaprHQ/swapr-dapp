import React, { useCallback, useContext, useState } from 'react'
import { Box, Text } from 'rebass'
import { useSpring } from '@react-spring/web'
import { useMeasure } from 'react-use'

import {
  Wrapper,
  TabContainer,
  ToggleOption,
  ToggleWrapper,
  AnimatedSlide,
  AnimatedToggleIndicator,
} from './Manage.styles'
import { CloseIcon } from '../../../theme'
import { RowBetween } from '../../Row'
import { GoBackIcon } from '../GoBackIcon'
import { ManageLists } from '../ManageLists'
import { ManageTokens } from '../ManageTokens'
import { CurrencyModalView } from '../CurrencySearchModal'

import { CurrencySearchModalContext } from '../CurrencySearchModal/CurrencySearchModal.context'
import { ManageProps } from './Manage.types'

export const Manage = ({ onDismiss }: ManageProps) => {
  const { setModalView, setImportToken } = useContext(CurrencySearchModalContext)
  const [showLists, setShowLists] = useState(true)

  const [ref, { width }] = useMeasure()
  const [styles, api] = useSpring({ x: 0 }, [width])
  const [tabIndicatorStyles, tabIndicatorApi] = useSpring(() => ({ x: '0%' }))

  const handleListsClick = useCallback(() => {
    setShowLists(true)
    tabIndicatorApi.start({ x: '0%' })
    api.start({ x: 0 })
  }, [api, tabIndicatorApi])

  const handleTokensClick = useCallback(() => {
    setShowLists(false)
    tabIndicatorApi.start({ x: '100%' })
    api.start({ x: -width })
  }, [api, width, tabIndicatorApi])

  return (
    <Wrapper ref={ref} data-testid="token-list-manager">
      <Box p="20px">
        <RowBetween>
          <GoBackIcon data-testid="go-back-icon" onClick={() => setModalView(CurrencyModalView.SEARCH)} />
          <Text fontWeight={500} fontSize={16} data-testid="token-manager-title">
            Select a {showLists ? 'list' : 'token'}
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
      </Box>
      <Box px="20px">
        <ToggleWrapper>
          <AnimatedToggleIndicator style={tabIndicatorStyles} />
          <ToggleOption onClick={handleListsClick} active={showLists} data-testid="switch-to-lists-button">
            Lists
          </ToggleOption>
          <ToggleOption onClick={handleTokensClick} active={!showLists} data-testid="switch-to-tokens-button">
            Tokens
          </ToggleOption>
        </ToggleWrapper>
      </Box>
      <TabContainer>
        <AnimatedSlide style={styles} data-testid="token-lists-manage">
          <ManageLists />
        </AnimatedSlide>
        <AnimatedSlide style={styles} data-testid="single-token-manage">
          <ManageTokens setModalView={setModalView} setImportToken={setImportToken} />
        </AnimatedSlide>
      </TabContainer>
    </Wrapper>
  )
}
