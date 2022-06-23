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
  ButtonWhite,
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
  ButtonWhite,
  AddSWPRToMetamaskButton,
]

export default {
  title: 'Buttons',
  component: Base,
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

//This story displays just styled components buttons which have no extra functionality
export const StyledButtons = StyleButtons.bind({})
// some shit here
export const ButtonConfirmed = ButtonConfirmedTemplate.bind({})
ButtonConfirmed.args = {
  content: 'some text here',
  confirmed: true,
  width: 'fit-content',
  altDisabledStyle: true,
}

export const ButtonError = ButtonErrorTemplate.bind({})
ButtonError.args = {
  error: true,
  content: 'text here',
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
  link: 'https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards',
  text: 'some text here',
  style: { width: 'fit-content' },
}
