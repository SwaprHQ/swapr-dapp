import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { ReactComponent as EcoRouter } from '../../assets/svg/eco-router.svg'
import { ecoBridgeUIActions } from '../../services/EcoBridge/store/UI.reducer'
import Row from '../Row'

const TabsColumn = styled.div`
  max-width: 457px;
  width: 100%;
`

const TabsRow = styled(Row)`
  display: inline-flex;
  width: auto;
  margin: 0 0 10px;
  padding: 2px;
  background: ${({ theme }) => theme.bg6};
  border-radius: 12px;
`

const Button = styled.button`
  display: flex;
  align-items: center;
  padding: 7px 10px;
  font-weight: 600;
  font-size: 11px;
  line-height: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text5};
  border-radius: 10px;
  border: none;
  background: none;
  cursor: pointer;

  &.active {
    color: #ffffff;
    background: ${({ theme }) => theme.bg2};
    font-size: 12px;
    line-height: 14px;
  }

  &:disabled {
    color: ${({ theme }) => theme.text6};
    cursor: not-allowed;
  }
`

const StyledEcoRouter = styled(EcoRouter)`
  margin-right: 5px;
`

export const Tabs = () => {
  const { t } = useTranslation('swap')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (
    <TabsColumn>
      <TabsRow>
        <Button className="active">
          <StyledEcoRouter />
          Eco Router V1.5
        </Button>
        <Button disabled={true}>{t('tabs.limit')}</Button>
        <Button
          onClick={() => {
            dispatch(ecoBridgeUIActions.setBridgeSwapStatus(true))
            navigate('/bridge')
          }}
        >
          {t('tabs.bridgeSwap')}
        </Button>
      </TabsRow>
    </TabsColumn>
  )
}
