import { Link } from 'react-router-dom'
import styled from 'styled-components'

import logoImage from '../../assets/images/swapr_white_no_badge.svg'
import { breakpoints } from '../../utils/theme'

const Logo = styled.img.attrs({ src: logoImage })`
  height: 40px;

  @media screen and (max-width: ${breakpoints.s}) {
    height: 34px;
  }
`

export function SwaprVersionLogo() {
  return (
    <Link to="/">
      <Logo />
    </Link>
  )
}
