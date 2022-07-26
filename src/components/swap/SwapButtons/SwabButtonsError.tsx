import React from 'react'

import { SwapCallbackError } from '../styleds'

export const ErrorBox = ({
  isExpertMode,
  swapErrorMessage,
  isSpaceAtTop = true,
}: {
  isExpertMode: boolean
  swapErrorMessage?: string
  isSpaceAtTop?: boolean
}) => (
  <>
    {isExpertMode && !!swapErrorMessage && <SwapCallbackError isSpaceAtTop={isSpaceAtTop} error={swapErrorMessage} />}
  </>
)
