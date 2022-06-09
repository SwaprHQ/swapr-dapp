import React from 'react'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'
import Badge from '../Badge'

const AbsoluteBadgeFlex = styled(Flex)`
  position: absolute;
  top: 20px;
  left: 50%;
  min-width: 100%;
  transform: translate(-50%);
`

export interface HeaderLinkBadgeProps {
  label: string
}

export const HeaderLinkBadge = ({ label }: HeaderLinkBadgeProps) => {
  return (
    <AbsoluteBadgeFlex justifyContent="center">
      <Box>
        <Badge label={label} />
      </Box>
    </AbsoluteBadgeFlex>
  )
}
