import React from 'react'
import styled from 'styled-components'
import { ChevronDown, ChevronUp } from 'react-feather'

const StyledAdvancedSwapDetailsButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: rgba(104, 110, 148, 0.3);
  border-radius: 4px;
  height: 18px;
  width: 22px;
`

export const AdvancedSwapDetailsToggle = ({
  showAdvancedSwapDetails,
  setShowAdvancedSwapDetails
}: {
  showAdvancedSwapDetails: boolean
  setShowAdvancedSwapDetails: (value: boolean) => void
}) => {
  return (
    <StyledAdvancedSwapDetailsButton onClick={() => setShowAdvancedSwapDetails(!showAdvancedSwapDetails)}>
      {showAdvancedSwapDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </StyledAdvancedSwapDetailsButton>
  )
}
