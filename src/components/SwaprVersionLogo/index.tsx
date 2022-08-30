import styled from 'styled-components'

import packageJson from '../../../package.json'
import logoImage from '../../assets/svg/swapr_white_no_badge.svg'
import { breakpoints } from '../../utils/theme'

const Logo = styled.img.attrs({ src: logoImage })`
  height: 40px;

  @media screen and (max-width: ${breakpoints.s}) {
    height: 34px;
  }
`

const RelativeContainer = styled.div`
  position: relative;
`

const Badge = styled.div`
  position: absolute;
  bottom: -4px;
  right: 0;
  background: ${({ theme }) => theme.bg3};
  padding: 3px 4px;
  color: ${({ theme }) => theme.text1};
  border-radius: 4px;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
`

export function SwaprVersionLogo() {
  return (
    <RelativeContainer>
      <Logo />
      <Badge>{packageJson.version}</Badge>
    </RelativeContainer>
  )
}
