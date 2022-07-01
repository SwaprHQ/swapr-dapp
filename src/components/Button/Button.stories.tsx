import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'
import styled from 'styled-components'

import { componentName } from '../../utils'

import {
  Base,
  ButtonConfirmed as ButtonConfirm,
  ButtonConfirmedProps,
  ButtonError as ButtonErr,
  ButtonErrorProps,
  ButtonExternalLink as ButtonLink,
  ButtonLinkProps,
  CarrotButton as Carrot,
  StyledButtonsArray,
} from '.'

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

const ButtonWithLinkTemplate: ComponentStory<typeof ButtonLink> = args => <ButtonLink {...args} />

const CarrotButtonTemplate: ComponentStory<typeof Carrot> = (args: ButtonLinkProps) => <Carrot {...args} />

export const StyledButtons = StyleButtons.bind({})

export const ButtonConfirmed = ButtonConfirmedTemplate.bind({})
ButtonConfirmed.args = {
  children: 'Button Confirmed Text',
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
  link: 'https://www.youtube.com/',
  children: 'Stack Sats',
  style: { width: 'fit-content' },
}

export const CarrotButton = CarrotButtonTemplate.bind({})
CarrotButton.args = {
  link: 'https://carrot.eth.limo/',
  children: 'Carrot Button text',
  style: { width: 'fit-content' },
}
