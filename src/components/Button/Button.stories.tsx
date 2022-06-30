import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'
import styled from 'styled-components'

import { componentName } from '../../utils'

import {
  AddSWPRToMetamaskButton,
  Base,
  ButtonConfirmed as ButtonConfirm,
  ButtonConfirmedProps,
  ButtonDark1,
  ButtonDark2,
  ButtonEmpty,
  ButtonError as ButtonErr,
  ButtonErrorProps,
  ButtonGrey,
  ButtonInvisbile,
  ButtonWithLink as ButtonLink,
  ButtonLinkProps,
  ButtonOutlined,
  ButtonPrimary,
  ButtonPurple,
  ButtonSecondary,
  CarrotButton as Carrot,
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
  AddSWPRToMetamaskButton,
]

export default {
  title: 'Buttons',
  component: Base,
  subcomponents: { ButtonErr, ButtonLink, Carrot },
} as ComponentMeta<typeof Base>

const Wrapper = styled.div`
  flex-wrap: wrap;
  display: flex;
  gap: 24px;
`

const StyleButtons = () => (
  <Wrapper>
    {StyledButtonsArray.map((Component: any) => (
      <Component style={{ width: 'auto' }} key={Component.index}>
        {componentName(Component)}
      </Component>
    ))}
  </Wrapper>
)
const ButtonConfirmedTemplate: ComponentStory<typeof ButtonConfirm> = (args: ButtonConfirmedProps) => (
  <ButtonConfirm {...args} />
)
const ButtonErrorTemplate: ComponentStory<typeof ButtonErr> = (args: ButtonErrorProps) => <ButtonErr {...args} />

const ButtonWithLinkTemplate: ComponentStory<typeof ButtonLink> = (args: ButtonLinkProps) => <ButtonLink {...args} />

const CarrotButtonTemplate: ComponentStory<typeof Carrot> = (args: ButtonLinkProps) => <Carrot {...args} />

export const StyledButtons = StyleButtons.bind({})

export const ButtonConfirmed = ButtonConfirmedTemplate.bind({})
ButtonConfirmed.args = {
  content: 'Button Confirmed Text',
  confirmed: true,
  width: 'fit-content',
  altDisabledStyle: true,
}

export const ButtonError = ButtonErrorTemplate.bind({})
ButtonError.args = {
  error: true,
  content: 'Button Error Text',
  width: 'fit-content',
}
export const ButtonWithLink = ButtonWithLinkTemplate.bind({})
ButtonWithLink.args = {
  link:
    'https://dcabtc.com/what-is-stacking-sats#:~:text=In%20short%2C%20stacking%20sats%20is,the%20smallest%20unit%20in%20Bitcoin.',
  text: 'Stack Sats',
  style: { width: 'fit-content' },
}

export const CarrotButton = CarrotButtonTemplate.bind({})
CarrotButton.args = {
  link: 'https://carrot.eth.limo/',
  text: 'Carrot Button text',
  style: { width: 'fit-content' },
}
