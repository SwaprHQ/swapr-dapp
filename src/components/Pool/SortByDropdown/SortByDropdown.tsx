import { useRef, useState } from 'react'
import { ChevronDown } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Flex, Text } from 'rebass/styled-components'
import styled, { useTheme } from 'styled-components'

import { LIQUIDITY_SORTING_TYPES } from '../../../constants'
import { useOnClickOutside } from '../../../hooks/useOnClickOutside'
import Popover from '../../Popover'

export function SortByDropdown({
  sortBy,
  onSortByChange,
}: {
  sortBy: string
  onSortByChange: (sortBy: string) => void
}) {
  const popoverRef = useRef()
  const { t } = useTranslation('pool')
  const [isOpen, setIsOpen] = useState(false)
  const theme = useTheme()
  useOnClickOutside(popoverRef, () => setIsOpen(false))

  return (
    <Flex alignItems="center" ml="18px" ref={popoverRef}>
      <Popover
        placement="bottom-end"
        show={isOpen}
        content={
          <List>
            {Object.entries(LIQUIDITY_SORTING_TYPES).map(([key, value]) => (
              <ListItem key={key}>
                <Text
                  fontWeight={600}
                  fontSize={10}
                  color={theme.purple2}
                  onClick={() => {
                    onSortByChange(key)
                    setIsOpen(false)
                  }}
                >
                  {value}
                </Text>
              </ListItem>
            ))}
          </List>
        }
      >
        <StyledFlex alignItems="center" onClick={() => setIsOpen(!isOpen)}>
          <StyledText fontWeight={600} fontSize={10} color={theme.purple2}>
            {t('dropdown.sortBy', { option: LIQUIDITY_SORTING_TYPES[sortBy] })}
          </StyledText>
          <ChevronDown color={theme.purple2} size={16} />
        </StyledFlex>
      </Popover>
    </Flex>
  )
}

export const List = styled.ul`
  margin: 0;
  padding: 0;
`

export const ListItem = styled.li`
  cursor: pointer;
  & + & {
    margin-top: 28px;
  }
`

export const StyledText = styled(Text)`
  text-transform: uppercase;
`

export const StyledFlex = styled(Flex)`
  cursor: pointer;
  gap: 4px;
`
