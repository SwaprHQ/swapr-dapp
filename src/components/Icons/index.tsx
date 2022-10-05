import styled from 'styled-components'

import triangleIcon from '../../assets/images/triangle.svg'

const Triangle = styled.img`
  margin-left: 6px;
`

export const TriangleIcon = () => <Triangle src={triangleIcon} alt="triangle" />
