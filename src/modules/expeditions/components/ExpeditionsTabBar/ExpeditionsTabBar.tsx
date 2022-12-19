import { Badge, Button, TabRow } from './ExpeditionsTabBar.styled'

export enum ExpeditionsTabs {
  TASKS,
  REWARDS,
}

interface ExpeditionsTabBarProps {
  activeTab: ExpeditionsTabs
  setActiveTab: (tab: ExpeditionsTabs) => void
  claimableRewards: number
}

export const ExpeditionsTabBar = ({ activeTab, setActiveTab, claimableRewards = 0 }: ExpeditionsTabBarProps) => {
  return (
    <TabRow>
      <Button
        onClick={() => setActiveTab(ExpeditionsTabs.TASKS)}
        className={activeTab === ExpeditionsTabs.TASKS ? 'active' : ''}
      >
        Active
      </Button>
      <Button
        onClick={() => {
          setActiveTab(ExpeditionsTabs.REWARDS)
        }}
        className={activeTab === ExpeditionsTabs.REWARDS ? 'active' : ''}
      >
        {<Badge badgeTheme={claimableRewards ? 'green' : 'orange'}>{claimableRewards}</Badge>}
        Rewards
      </Button>
    </TabRow>
  )
}
