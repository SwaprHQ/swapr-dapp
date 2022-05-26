import { Text } from 'rebass'
import styled from 'styled-components'

export const SelectionListWindowWrapper = styled.div<{ extraMarginTop?: string }>`
  width: 100%;
  margin-bottom: 10px;
  margin-top: ${({ extraMarginTop }) => (extraMarginTop ? extraMarginTop : '0')};
`
export const SelectionListLabelWrapper = styled.div`
  margin-bottom: 14px;
  background: transparent;
  display: flex;
`
export const SelectionListLabel = styled(Text)<{ justify?: boolean; flex?: string }>`
  color: ${({ theme }) => theme.text5}
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  display: flex;
  flex: ${({ flex }) => flex || '15%'};
  justify-content: ${({ justify }) => (justify ? 'start' : 'end')};
`
export const SelectionListOption = styled.div<{ isSelected: boolean; isLoading?: boolean }>`
  background: ${({ isSelected }) => (isSelected ? 'rgba(104,110,148,.16)' : 'rgba(104,110,148,.1)')};
  width: 100%;
  border-radius: 8px;
  padding: 8px 0px;
  border: ${({ isSelected }) => (isSelected ? '1px solid rgba(120,115,164,.7)' : `1px solid transparent`)};
  margin-top: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.4s ease;
  cursor: ${({ isLoading }) => (isLoading ? 'not-allowed' : 'pointer')};
`
export const SelectionListName = styled(Text)<{ isSelected: boolean; flex?: string }>`
  margin: 0;
  font-weight: ${({ isSelected }) => (isSelected ? '600' : '500')};
  font-size: 14px;
  color: ${({ isSelected, theme }) => (isSelected ? theme.text1 : theme.text3)};
  padding-left: 10px;
  flex: ${({ flex }) => flex || '45%'};
`
export const SelectionListDetails = styled(Text)<{ flex?: string }>`
  font-weight: 500;
  font-size: 10px;
  color: ${({ theme }) => theme.text5};
  text-transform: uppercase;
  display: flex;
  justify-content: end;
  min-width: 100%;
  flex: ${({ flex }) => flex || '15%'};
`
export const SelectionListReceiveAmount = styled(SelectionListDetails)`
  font-weight: 600;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  display: flex;
  justify-content: end;
  padding-right: 10px;
`
