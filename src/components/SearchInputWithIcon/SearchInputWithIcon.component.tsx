import React, { useContext } from 'react'
import { Search } from 'react-feather'
import { ThemeContext } from 'styled-components'

import { SearchExpandedInput, SearchInputWrapper } from './SearchInputWithIcon.styles'
import { SearchInputWithIconProps } from './SearchInputWithIcon.types'

export const SearchInputWithIcon = ({ fontWeight, width, height, fontSize, className }: SearchInputWithIconProps) => {
  const theme = useContext(ThemeContext)

  return (
    <SearchInputWrapper className={className} width={width} height={height}>
      <SearchExpandedInput placeholder="SEARCH" fontSize={fontSize} fontWeight={fontWeight} />
      <Search color={theme.text4} size={14} />
    </SearchInputWrapper>
  )
}
