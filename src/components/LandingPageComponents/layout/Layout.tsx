import { ReactNode } from 'react'
import styled from 'styled-components'

const StyledLayout = styled.div`
  /* background: white; */
`

export interface LayoutProps {
  width?: 'full-width' | 'main-width'
  className?: string
  children: ReactNode
  'data-aos'?: string
  id?: string
  isChartActive?: boolean
}

const Layout = (props: LayoutProps) => {
  const { className = '', width = 'full-width', id = 'layoutId' } = props

  return (
    <StyledLayout data-aos={props['data-aos']} id={id} className={`${className} ${width}`}>
      {props.children}
    </StyledLayout>
  )
}

export default Layout
