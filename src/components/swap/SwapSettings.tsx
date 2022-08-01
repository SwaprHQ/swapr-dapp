import { transparentize } from 'polished'
import { useTranslation } from 'react-i18next'
import { Text } from 'rebass'
import { Button } from 'rebass/styled-components'
import styled, { useTheme } from 'styled-components'

import { ReactComponent as EcoRouter } from '../../assets/svg/eco-router.svg'
import { ReactComponent as MEVProtection } from '../../assets/svg/mev-protection.svg'
import { ReactComponent as Recipient } from '../../assets/svg/recipient.svg'
import { ReactComponent as Slippage } from '../../assets/svg/slippage.svg'
import { useToggleSettingsMenu } from '../../state/application/hooks'
import { useSwapState } from '../../state/swap/hooks'
import { useMultihopManager, useUserSlippageTolerance } from '../../state/user/hooks'
import { RowFixed } from '../Row/index'
import { MouseoverTooltip } from '../Tooltip/index'

const StyledButton = styled(Button)<{ active?: boolean; cursor?: string }>`
  height: 20px;
  cursor: ${({ cursor }) => cursor};
  line-height: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  background-color: ${({ theme, active }) => (active ? transparentize(0.92, theme.green2) : theme.bg7)};
  border-radius: ${({ active }) => active && '5px'};
  border: ${({ theme, active }) => `solid 1px ${active ? transparentize(0.35, theme.green2) : theme.bg7}`};
  font-size: 10px;
  padding: 4px 4px;
  path {
    fill: ${({ theme, active }) => (active ? theme.green2 : theme.gray1)};
  }
`

const StyledRowFixed = styled(RowFixed)`
  > *:not(:first-child) {
    margin-left: 8px;
  }
`

interface SwapSettingsProps {
  showAddRecipient: boolean
  setShowAddRecipient: (value: boolean) => void
  isMEVProtectionEnabled?: boolean
}

export function SwapSettings({
  showAddRecipient,
  setShowAddRecipient,
  isMEVProtectionEnabled = false,
}: SwapSettingsProps) {
  const userSlippageTolerance = useUserSlippageTolerance()
  const [multihop] = useMultihopManager()
  const theme = useTheme()
  const { recipient } = useSwapState()
  const toggle = useToggleSettingsMenu()
  const { t } = useTranslation('swap')

  return (
    <StyledRowFixed alignItems="center">
      <MouseoverTooltip content={t('settings.slippagePercentage')} placement="top">
        <StyledButton active={!!userSlippageTolerance} cursor="pointer" onClick={toggle}>
          <Slippage />
          <Text color={userSlippageTolerance ? transparentize(0.2, theme.green2) : theme.gray1} ml="4px">
            {(userSlippageTolerance / 100).toFixed(1)}%
          </Text>
        </StyledButton>
      </MouseoverTooltip>
      <MouseoverTooltip
        content={multihop ? t('settings.multihopEnabled') : t('settings.multihopDisabled')}
        placement="top"
      >
        <StyledButton active={multihop} cursor="pointer" onClick={toggle} data-testid="multihop-icon">
          <EcoRouter />
        </StyledButton>
      </MouseoverTooltip>
      <MouseoverTooltip content={t('settings.alternateReceiver')} placement="top">
        <StyledButton
          data-testid="alternate-receiver-button"
          active={!!recipient}
          cursor="pointer"
          onClick={() => setShowAddRecipient(!showAddRecipient)}
        >
          <Recipient />
        </StyledButton>
      </MouseoverTooltip>
      <MouseoverTooltip content={t('settings.MEVProtection')} placement="top">
        <StyledButton active={isMEVProtectionEnabled}>
          <MEVProtection />
        </StyledButton>
      </MouseoverTooltip>
    </StyledRowFixed>
  )
}
