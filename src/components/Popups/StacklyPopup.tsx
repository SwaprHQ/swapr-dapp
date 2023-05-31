import styled from 'styled-components'

import StacklyGreenLogo from '../../assets/images/stackly-green-logo.svg'
import StacklyYellowLogo from '../../assets/images/stackly-yellow-logo.svg'
import { Button } from '../../theme'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'

interface IStacklyPopup {
  isStacklyOldDesign: boolean
}

export function StacklyPopup({ isStacklyOldDesign }: IStacklyPopup) {
  return (
    <RowNoFlex isStacklyOldDesign={isStacklyOldDesign}>
      <AutoColumn gap="16px">
        <StacklyFont>
          Automate your DCA swaps
          <br />
          through Stackly
        </StacklyFont>
        <StacklyButton as="a" href="https://stackly.eth.limo" target="_blank" isStacklyOldDesign={isStacklyOldDesign}>
          Learn more
        </StacklyButton>
        <StacklyImage
          src={isStacklyOldDesign ? StacklyYellowLogo : StacklyGreenLogo}
          isStacklyOldDesign={isStacklyOldDesign}
        />
      </AutoColumn>
    </RowNoFlex>
  )
}

const RowNoFlex = styled(AutoRow)<IStacklyPopup>`
  flex-wrap: nowrap;
  margin-right: 16px;
  background: ${({ isStacklyOldDesign }) => (isStacklyOldDesign ? '#fac336' : '#a2e771')};
`

const StacklyImage = styled.img<IStacklyPopup>`
  position: absolute;
  bottom: ${({ isStacklyOldDesign }) => (isStacklyOldDesign ? '12px' : '0')};
  right: ${({ isStacklyOldDesign }) => (isStacklyOldDesign ? '22px' : '5px')};
`

const StacklyFont = styled.p`
  font-weight: 600;
  font-size: 18px;
  color: #060d00;
`
const StacklyButton = styled(Button)<IStacklyPopup>`
  background: ${({ isStacklyOldDesign }) => (isStacklyOldDesign ? '#0C0C0C' : '#fff')};
  border-radius: 8px;
  box-shadow: 0px 2px 4px -2px rgba(17, 12, 34, 0.12);
  padding: 8px 10px;
  width: fit-content;
  height: 32px;

  :active,
  :focus,
  :hover {
    background: ${({ isStacklyOldDesign }) => (isStacklyOldDesign ? '#0C0C0C' : '#fff')};
  }

  font-size: 12px;
  font-weight: 600;
  color: ${({ isStacklyOldDesign }) => (isStacklyOldDesign ? '#fff' : '#4d4f4c')};
`
