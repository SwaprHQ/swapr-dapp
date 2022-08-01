import { darken } from 'polished'
import { ArrowLeft } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { useRouter } from '../../hooks/useRouter'
import QuestionHelper from '../QuestionHelper'
import { RowBetween } from '../Row'
import { Settings } from '../Settings'

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 3rem;
  justify-content: space-evenly;
`

const StyledNavLink = styled(NavLink).withConfig({
  shouldForwardProp: prop => !['isActive'].includes(prop),
})<{ isActive: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 20px;

  &.active {
    ${props =>
      props.isActive &&
      `
    border-radius: 12px;
    font-weight: 500;
    color: ${props.theme.text1};
    `}
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const ActiveText = styled.div`
  font-weight: 500;
  font-size: 18px;
  line-height: 22px;
  color: ${({ theme }) => theme.purple3};
`

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.purple3};
  cursor: pointer;
`

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' | 'bridge' }) {
  const { t } = useTranslation('common')

  return (
    <Tabs style={{ marginBottom: '20px', display: 'none' }}>
      <StyledNavLink id="swap-nav-link" to="/swap" isActive={active === 'swap'}>
        {t('swap')}
      </StyledNavLink>
      <StyledNavLink id="bridge-nav-link" to="/bridge" isActive={active === 'bridge'}>
        {t('bridge')}
      </StyledNavLink>
      <StyledNavLink id="pool-nav-link" to="/pools" isActive={active === 'pool'}>
        {t('pool')}
      </StyledNavLink>
    </Tabs>
  )
}

export function FindPoolTabs() {
  const { navigate } = useRouter()
  return (
    <Tabs>
      <RowBetween mb="16px">
        <StyledArrowLeft onClick={() => navigate(-1)} />
        <ActiveText>Import Pool</ActiveText>
        <QuestionHelper text={"Use this tool to find pairs that don't automatically appear in the interface."} />
      </RowBetween>
    </Tabs>
  )
}

export function AddRemoveTabs({ adding, creating }: { adding: boolean; creating: boolean }) {
  const { navigate } = useRouter()
  return (
    <Tabs>
      <RowBetween mb="16px">
        <StyledArrowLeft onClick={() => navigate(-1)} />
        <ActiveText>{creating ? 'Create a pair' : adding ? 'Add Liquidity' : 'Remove Liquidity'}</ActiveText>
        <Settings simple={true} />
      </RowBetween>
    </Tabs>
  )
}
