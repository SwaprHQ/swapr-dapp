import React, { FC } from 'react'
import Skeleton from 'react-loading-skeleton'
import styled from 'styled-components'

const ListContentItem = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 10px;
  & > *:nth-child(1) {
    flex-basis: 40%;
  }
  & > *:nth-child(2),
  & > *:nth-child(2) {
    flex-basis: 20%;
  }
  & > *:last-child {
    flex-basis: 80px;
    display: flex;
    justify-content: flex-end;
  }
`

export const ListHeader = styled(ListContentItem)`
  font-weight: bold;
  padding: 0 9px;
  font-weight: 600;
  line-height: 12px;
  text-transform: uppercase;
  margin-bottom: 10px;
  color: ${props => props.theme.purple3};
  &:first-child,
  &:last-child {
    padding: 0;
  }
`

interface PlatformSelectorLoaderProps {
  showGasFeeColumn?: boolean
}

/**
 * A Skeleton loader for the platform selector
 */
export const PlatformSelectorLoader: FC<PlatformSelectorLoaderProps> = ({ showGasFeeColumn }) => (
  <>
    {[0, 1, 2].map(i => (
      <ListContentItem key={i}>
        <Skeleton width="72px" height="12px" />
        <Skeleton width="36px" height="12px" />
        <Skeleton width="36px" height="12px" />
        {showGasFeeColumn && <Skeleton width="36px" height="12px" />}
        <Skeleton width="36px" height="12px" />
      </ListContentItem>
    ))}
  </>
)
