import { ReactNode } from 'react'

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
    <div data-aos={props['data-aos']} id={id} className={`${className} ${width}`}>
      {props.children}
    </div>
  )
}

export default Layout
