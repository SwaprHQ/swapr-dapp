import React, { useCallback, useState } from 'react'
import { RowBetween } from '../../Row'
import { Box, Text } from 'rebass'
import { ManageLists } from '../ManageLists'
import { ManageTokens } from '../ManageTokens'
import { CurrencyModalView } from '../CurrencySearchModal'
import { CloseIcon } from '../../../theme'
import { useMeasure } from 'react-use'
import { useSpring } from '@react-spring/web'
import { GoBackIcon } from '../GoBackIcon'
import { ManageProps } from './Manage.types'
import {
  Wrapper,
  TabContainer,
  ToggleOption,
  ToggleWrapper,
  AnimatedSlide,
  AnimatedToggleIndicator
} from './Manage.styles'

export const Manage = ({
  onDismiss,
  setModalView,
  setImportToken,
  manageListsProps,
  listRowEntryProps
}: ManageProps) => {
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
    <Wrapper ref={ref}>
      <Box p="20px">
        <RowBetween>
          <GoBackIcon onClick={() => setModalView(CurrencyModalView.SEARCH)} />
          <Text fontWeight={500} fontSize={16}>
            Select a {showLists ? 'list' : 'token'}
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
      </Box>
      <Box px="20px">
        <ToggleWrapper>
          <AnimatedToggleIndicator style={tabIndicatorStyles} />
          <ToggleOption onClick={handleListsClick} active={showLists}>
            Lists
          </ToggleOption>
          <ToggleOption onClick={handleTokensClick} active={!showLists}>
            Tokens
          </ToggleOption>
        </ToggleWrapper>
      </Box>
      <TabContainer>
        <AnimatedSlide style={styles}>
          <ManageLists {...manageListsProps} listRowEntryProps={listRowEntryProps} />
        </AnimatedSlide>
        <AnimatedSlide style={styles}>
          <ManageTokens setModalView={setModalView} setImportToken={setImportToken} />
        </AnimatedSlide>
      </TabContainer>
    </Wrapper>
  )
}
