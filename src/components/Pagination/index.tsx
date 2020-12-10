import { darken } from 'polished'
import React from 'react'
import styled from 'styled-components'
import { Text } from 'rebass'

import Card from '../Card'
import { RowBetween } from '../Row'

import nextImage from '../../assets/svg/next.svg'
import prevImage from '../../assets/svg/prev.svg'

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const HoverCard = styled(Card)`
  border: 1px solid transparent;
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`
const PaginationWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const PaginationButton = styled.button`
  width: 28px;
  height: 22px;
  border: 1px solid #444163;
  box-sizing: border-box;
  border-radius: 4px;
  background: transparent;
  color: ${(props: { active?: boolean }) => (props.active ? '#DDDAF8' : '#8780BF')};
  border: ${(props: { active?: boolean }) => (props.active ? '1px solid #DDDAF8' : '1px solid #444163')};
  margin: 0 2px;

  &:active {
    outline: none;
  }
`

const PrevButton = styled(PaginationButton)`
  margin: 0;
`

const NextButton = styled(PaginationButton)`
  margin: 0;
`

interface PaginationProps {
  length: number
}

export function Pagination({ length }: PaginationProps) {
  return (
    <PaginationWrapper>
      <PrevButton>
        <img src={prevImage} alt="prev" />
      </PrevButton>
      {new Array(length).fill(0).map((_, index) => (
        <PaginationButton key={index}>
          <Text fontWeight={500} fontSize="14px">
            {index + 1}
          </Text>
        </PaginationButton>
      ))}
      <NextButton>
        <img src={nextImage} alt="next" />
      </NextButton>
    </PaginationWrapper>
  )
}
