import styled from 'styled-components'

import { TYPE } from '../../../theme'
import Card, { LightCard } from '../../../components/Card'
import { ButtonSecondary } from '../../../components/Button'

export const Container = styled(LightCard)`
  background-color: #171621;
  padding: 34px 28px;
`

export const ContentTitle = styled(TYPE.main)<{ big?: boolean }>`
  font-weight: 500;
  font-size: ${({ big }) => (big ? '16px' : '14px')};
  line-height: ${({ big }) => (big ? '19.5px' : '17.07px')};
  color: ${({ theme, big }) => (big ? theme.white : theme.purple3)};
`

export const ContentCard = styled(Card)`
  background: radial-gradient(147.37% 164.97% at 50% 0%, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 100%), #1f1d2c;
  background-blend-mode: overlay, normal;
  border-radius: 8px;
  padding: 24px 20px;
`

export const TextCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.purple3};
  border-radius: 4px;
  height: 16px;
  padding: 2px 6px;
  align-items: center;
  width: auto;
`

export const InfoText = styled(TYPE.main)`
  color: ${({ theme }) => theme.purple3};
  font-style: normal;
  font-size: 11px;
  font-weight: 600;
  line-height: 12px;
  letter-spacing: 2%;
`

export const ProgressDiv = styled.div<{ width: string; color: string }>`
  width: ${({ width }) => width};
  height: 4px;
  border-radius: 4px;
  background-color: ${({ color }) => color};
`

export const VoteButton = styled(ButtonSecondary)<{ bgColor: string; border: string; color: string }>`
  background-color: ${({ bgColor }) => bgColor};
  border: ${({ border }) => border};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: 0.08em;
  color: ${({ color }) => color};
  padding: 11px;
`

export const ProposerAddress = styled(TYPE.main)`
  font-weight: 500;
  font-style: normal;
  font-size: 10px;
  line-height: 12.19px;
  letter-spacing: 8%;
  text-align: center;
  color: ${({ theme }) => theme.text5};
  text-transform: uppercase;
`
