import { Search } from 'react-feather'
import { useTheme } from 'styled-components'

import { SearchExpandedInput, SearchInputWrapper } from './SearchInputWithIcon.styles'
import { SearchInputWithIconProps } from './SearchInputWithIcon.types'

export const SearchInputWithIcon = ({ fontWeight, width, height, fontSize, className }: SearchInputWithIconProps) => {
  const theme = useTheme()

  return (
    <SearchInputWrapper className={className} width={width} height={height}>
      <SearchExpandedInput placeholder="SEARCH" fontSize={fontSize} fontWeight={fontWeight} />
      <Search color={theme.text4} size={14} />
    </SearchInputWrapper>
  )
}
