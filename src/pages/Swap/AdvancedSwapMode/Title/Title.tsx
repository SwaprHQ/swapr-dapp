import { useState } from 'react'
import styled from 'styled-components'

import Row from '../../../../components/Row'
import { breakpoints } from '../../../../utils/theme'
import { TitleColumn } from '../AdvancedSwapMode.styles'

const TabsColumn = styled(TitleColumn)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
`

const TabsRow = styled(Row)`
  display: inline-flex;
  width: auto;
  padding: 2px;
  background: ${({ theme }) => theme.bg6};
  border-radius: 12px;
`

const Button = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: 7px 10px;
  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text5};
  border-radius: 10px;
  border: none;
  background: none;
  cursor: pointer;

  ${({ isActive, theme }) =>
    isActive &&
    `
    color: #ffffff;
    background: ${theme.bg2};
  `}

  &:disabled {
    color: ${({ theme }) => theme.text6};
    cursor: not-allowed;
  }
`

interface TabProp {
  title: string
  callback?: () => void
}

export const Title = ({ title, tabs, isSoloTab }: { title: string; tabs: TabProp[]; isSoloTab?: boolean }) => {
  const filteredTabs = tabs.filter(tab => tab.title !== '')
  const [activeTab, setActiveTab] = useState(0)

  const handleClick = (index: number) => {
    if (index !== activeTab) {
      setActiveTab(index)
    }
    const currentTab = filteredTabs[index]
    if (currentTab && currentTab?.callback) {
      currentTab.callback()
    }
  }

  return (
    <TabsColumn>
      <span>{title}</span>
      <TabsRow>
        {((!isSoloTab && filteredTabs.length > 1) || isSoloTab) &&
          filteredTabs.map((tab, index) => {
            return (
              <Button key={index + tab.title} isActive={activeTab === index} onClick={() => handleClick(index)}>
                {tab.title}
              </Button>
            )
          })}
      </TabsRow>
    </TabsColumn>
  )
}
