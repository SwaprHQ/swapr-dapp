import React, { useState } from 'react'
import styled from 'styled-components'

interface TabBarProps {
  tabs: {
    title: string
    render: () => void
  }[]
}

export default function TabBar({ tabs }: TabBarProps) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <>
      <TabContainer>
        {tabs.map((tab, index) => (
          <TabButton key={index} onClick={() => setActiveTab(index)}>
            <Title active={activeTab === index}>{tab.title}</Title>
            <Indicator active={activeTab === index} />
          </TabButton>
        ))}
      </TabContainer>
      {tabs[activeTab].render()}
    </>
  )
}

const TabContainer = styled.section`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 60px;
`

const TabButton = styled.button`
  width: auto;
  height: 100%;
  cursor: pointer;
  padding: 10px;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: 0.6s;
  background: transparent
  
  &:focus {
    outline: none;
  }
`

const Title = styled.span<{ active: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: inherit;
  font-size: 18px;
  color: ${props => (props.active ? props.theme.text4 : props.theme.text5)};
  transition: 0.6s;
`

const Indicator = styled.span<{ active: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-bottom-width: 2px;
  border-bottom-style: solid;
  border-bottom-color: ${props => (props.active ? props.theme.text4 : 'transparent')};
  transition: 0.6s;
`
