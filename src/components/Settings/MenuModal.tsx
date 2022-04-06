import styled from 'styled-components'
import { Settings as SettingsIcon } from 'react-feather'
import { transparentize } from 'polished'
import Modal from '../Modal'
import { RowBetween } from '../Row'
import { DarkCard } from '../Card'

export const MenuModal = styled(Modal)`
  && {
    position: absolute;
    top: 95px;
    right: 20px;
    max-width: 322px;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      position: fixed;
      right: initial;
      justify-content: center;
      align-items: center;
    `};

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      max-width: 100%;
    `};
  }
`

export const MenuModalHeader = styled(RowBetween)`
  @media only screen and (max-height: 600px) {
    padding: 24px 16px;
    box-shadow: 0px 16px 42px rgba(10, 10, 15, 0.45);
  }
`

export const ModalContentWrapper = styled(DarkCard)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 26px 0;
  ::before {
    background-color: ${props => props.theme.bg1And2};
  }
`

export const MenuModalContentWrapper = styled(ModalContentWrapper)`
  display: grid;
  grid-row-gap: 12px;
  padding: 20px;

  @media only screen and (max-height: 600px) {
    padding: 0;
    grid-gap: 0;
  }
`

export const MenuModalContent = styled.div`
  overflow-y: auto;
  max-height: 60vh;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
  }
`

export const MenuModalInner = styled.div`
  @media only screen and (max-height: 600px) {
    padding: 24px 16px;
  }
`

export const StyledMenu = styled.button`
  height: 32px;
  width: 32px;
  border-radius: 12px;
  margin-left: 7px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
  background: ${({ theme }) => transparentize(1, theme.bg1)};
  cursor: pointer;
  outline: none;
`

export const StyledMenuIconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 8px;
  height: 32px;
  width: 32px;
  cursor: pointer;
  background: ${props => props.theme.dark1};
  border-radius: 12px;
`

export const StyledMenuIcon = styled(SettingsIcon)`
  height: 15px;
  width: 15px;

  > * {
    stroke: ${({ theme }) => theme.text4};
  }
`
