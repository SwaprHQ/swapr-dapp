import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Toggle from '../../../../../../components/Toggle'
import { AppState } from '../../../../../../state'
import { useExpeditions } from '../../../../Expeditions.hooks'
import { expeditionsActions } from '../../../../Expeditions.reducer'
import { TaskCard } from '../../../ExpeditionsCards'

const Description = ({
  dailySwapsTracking,
  toggleSwapsTracking,
}: {
  dailySwapsTracking: boolean
  toggleSwapsTracking: () => void
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p>Get some fragments each day for swaping at least $10 on Swapr!</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <p>
          To participate in this task we need to track some information about your swaps. You can withdraw your consent
          anytime by clicking this button.
        </p>
        <Toggle id="toggle-expeidtions-tracking" isActive={dailySwapsTracking} toggle={toggleSwapsTracking} />
      </div>
    </div>
  )
}

export function DailySwapsTaskCard() {
  const {
    tasks: {
      dailySwaps: { endDate, fragments, startDate },
    },
  } = useExpeditions()
  const dailySwapsTracking = useSelector((state: AppState) => state.expeditions.dailySwapsTracked)
  const dispatch = useDispatch()

  const toggleSwapsTracking = useCallback(() => {
    dispatch(expeditionsActions.dailySwapsTrackingUpdated())
  }, [dispatch])

  const button = dailySwapsTracking ? (fragments > 0 ? 'Completed' : 'Task not yet completed') : undefined

  const overwriteStatus = !dailySwapsTracking ? 'inactive' : undefined

  return (
    <TaskCard
      button={button}
      buttonDisabled={true}
      claimed={fragments > 0}
      onClick={() => {}}
      startDate={startDate}
      endDate={dailySwapsTracking ? endDate : new Date(0)}
      description={<Description dailySwapsTracking={dailySwapsTracking} toggleSwapsTracking={toggleSwapsTracking} />}
      duration="Daily"
      title="Daily Swaps"
      overwriteStatus={overwriteStatus}
    />
  )
}
