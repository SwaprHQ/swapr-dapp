import styled from 'styled-components'
import { ButtonSecondary } from '../../../components/Button'

export const TitleWrapper = styled.div`
  margin: 10px 0px;
`
export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 24px 12px 12px;
  background: #181920;
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
export const ButtonCancel = styled(ButtonSecondary)`
  font-size: 13px;
`
