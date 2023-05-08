import { darken } from 'polished'
import { Check } from 'react-feather'
import styled from 'styled-components'

import { ButtonPrimary, ButtonSecondary } from '../../../components/Button'

export const TitleWrapper = styled.div`
  margin: 24px 0px;
`
export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 37px 37px 25px 37px;
  background: ${({ theme }) => theme.bg2};
`
export const ButtonsWrapper = styled.div`
  width: 100%;
  margin-top: 24px;
`
export const Button = styled(ButtonSecondary)`
  margin-top: 12px;
  font-weight: 500;
  font-size: 11px;
  line-height: 13px;
`
export const ButtonCancel = styled.button`
  font-size: 13px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text4};
  text-decoration: underline;
  margin-top: 8px;
  cursor: pointer;
`
export const DisclaimerTextWrapper = styled.div`
  padding: 24px 30px;
  background: ${({ theme }) => theme.bg1And2};
  border-radius: 12px;
  margin: 24px 0;

  p,
  span {
    color: ${({ theme }) => theme.text1};
  }
`
export const DisclaimerText = styled.p`
  font-weight: 500;
  font-size: 14px;
  margin-top: 24px;
  text-align: left;
  line-height: 17px;

  &:nth-child(1) {
    margin-top: 0px;
  }
  span {
    font-weight: 700;
  }
`
export const ButtonAccept = styled(ButtonPrimary)`
  background: ${({ theme }) => theme.primary1};

  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
`

export const SuccessCheck = styled(Check)`
  background-color: #8cc63f;
  border-radius: 50%;
  padding: 10px;
  stroke-width: 2px;
`
