import { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes } from 'react'

import { StyledButtonAddonsInnerWrapper, StyledInnerWrapper, StyledInput, StyledLabel, Wrapper } from './styled'

export interface ReactComponentPropsBase {
  children: React.ReactNode
}

export type InputGroupProps = ReactComponentPropsBase

export function InputGroup({ children }: InputGroupProps) {
  return <Wrapper>{children}</Wrapper>
}

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'children'>

export function Input(props: InputProps) {
  return <StyledInput {...props} />
}

export type InputGroupLabelProps = LabelHTMLAttributes<HTMLLabelElement>

export function Label(props: InputGroupLabelProps) {
  return <StyledLabel {...props} />
}

export type InnerWrapperProps = ReactComponentPropsBase

export function InnerWrapper(props: InnerWrapperProps) {
  return <StyledInnerWrapper {...props} />
}

export type ButtonAddonsWrapperProps = ReactComponentPropsBase

/**
 *
 * @returns
 */
export function ButtonAddonsWrapper(props: ButtonAddonsWrapperProps) {
  return <StyledButtonAddonsInnerWrapper>{props.children}</StyledButtonAddonsInnerWrapper>
}

export type AddonButtonProps = ReactComponentPropsBase &
  Partial<Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>>

/**
 * The AddonButton is the base component for all addon buttons.
 * Extend this component to create new addon buttons.
 */
export function AddonButton(props: AddonButtonProps) {
  return <>{props.children}</>
}

/**
 *
 */
InputGroup.Input = Input
InputGroup.Label = Label
InputGroup.InnerWrapper = InnerWrapper
InputGroup.ButtonAddonsWrapper = ButtonAddonsWrapper
InputGroup.AddonButton = AddonButton
