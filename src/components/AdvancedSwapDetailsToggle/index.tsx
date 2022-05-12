import React, { FC } from 'react'
import styled from 'styled-components'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Button } from 'rebass/styled-components'

const StyledAdvancedSwapDetailsButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: rgba(104, 110, 148, 0.3);
  padding: 0;
  height: 18px;
  width: 22px;
`

interface AdvancedSwapDetailsToggleProps {
  showAdvancedSwapDetails: boolean
  setShowAdvancedSwapDetails: (value: boolean) => void
}

export const AdvancedSwapDetailsToggle: FC<AdvancedSwapDetailsToggleProps> = ({
  showAdvancedSwapDetails,
  setShowAdvancedSwapDetails,
}) => {
  return (
    <StyledAdvancedSwapDetailsButton onClick={() => setShowAdvancedSwapDetails(!showAdvancedSwapDetails)}>
      {showAdvancedSwapDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </StyledAdvancedSwapDetailsButton>
  )
}
