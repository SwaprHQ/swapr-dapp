import { ComponentMeta } from '@storybook/react'
import React from 'react'
import styled from 'styled-components'

import { componentName } from '../../utils'

import {
  AddSWPRToMetamaskButton,
  Base,
  ButtonConfirmed,
  ButtonDark1,
  ButtonDark2,
  ButtonDropdown,
  ButtonDropdownLight,
  ButtonEmpty,
  ButtonGrey,
  ButtonInvisbile,
  ButtonOutlined,
  ButtonPrimary,
  ButtonPurple,
  ButtonSecondary,
  ButtonWhite,
  ButtonWithLink,
  CarrotButton,
  ShowMoreButton,
} from '.'

const StyledButtonsArray = [
  Base,
  ButtonPrimary,
  ButtonSecondary,
  ButtonGrey,
  ButtonInvisbile,
  ButtonDark1,
  ButtonPurple,
  ButtonDark2,
  ButtonOutlined,
  ButtonEmpty,
  ButtonWhite,
  ButtonConfirmed,
  ButtonWithLink,
  CarrotButton,
  ButtonDropdown,
  ButtonDropdownLight,
  AddSWPRToMetamaskButton,
  ShowMoreButton,
]

export default {
  title: 'Components/Button',
} as ComponentMeta
const Wrapper = styled.div`
  flex-wrap: wrap;
  display: flex;
  gap: 24px;
`
const Template = () => (
  <Wrapper>
    {StyledButtonsArray.map(Component => (
      <Component style={{ width: 'auto' }} key={Component.index}>
        {componentName(Component)}
      </Component>
    ))}
  </Wrapper>
)

export const Overview = Template.bind({})
