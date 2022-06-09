import { Placement } from '@popperjs/core'
import React, { ReactNode, RefObject, useRef } from 'react'

import unsupportedNetworkHintImage1x from '../../assets/images/unsupported-network-hint.png'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { useCloseModals } from '../../state/application/hooks'
import { CloseIcon } from '../../theme'
import { Image, Row, StyledPopover, Text, View } from '../NetworkSwitcher/NetworkSwitcher.styles'

interface UnsupportedNetworkPopoverProps {
  children?: ReactNode
  show: boolean
  placement?: Placement
  parentRef?: RefObject<HTMLElement>
}

export default function UnsupportedNetworkPopover({ children, show }: UnsupportedNetworkPopoverProps) {
  const closeModals = useCloseModals()
  const popoverRef = useRef(null)

  useOnClickOutside(popoverRef, show ? closeModals : undefined)

  return (
    <StyledPopover
      placement="bottom-end"
      show={show}
      content={
        <View ref={popoverRef} data-testid="unsupported-network-popover">
          <Row>
            <Text>Please use our network switcher and switch to a supported network.</Text>
            <CloseIcon onClick={closeModals} />
          </Row>
          <Image src={unsupportedNetworkHintImage1x} srcSet={unsupportedNetworkHintImage1x} alt="hint screenshot" />
        </View>
      }
    >
      {children}
    </StyledPopover>
  )
}
