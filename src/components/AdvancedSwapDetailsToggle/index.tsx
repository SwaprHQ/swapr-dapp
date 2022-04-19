import React, { FC } from 'react'
import styled from 'styled-components'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Flex } from 'rebass'

const StyledAdvancedSwapDetailsButton = styled(Flex)`
  cursor: pointer;
  background: rgba(104, 110, 148, 0.3);
  border-radius: 4px;
  height: 18px;
  width: 22px;
`

export const AdvancedSwapDetailsToggle: FC<{
  showAdvancedSwapDetails: boolean
  setShowAdvancedSwapDetails: (value: boolean) => void
}> = ({ showAdvancedSwapDetails, setShowAdvancedSwapDetails }) => {
  return (
    <StyledAdvancedSwapDetailsButton
      justifyContent="center"
      alignItems="center"
      onClick={() => setShowAdvancedSwapDetails(!showAdvancedSwapDetails)}
    >
      {showAdvancedSwapDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </StyledAdvancedSwapDetailsButton>
  )
}
