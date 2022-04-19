import React from 'react'
import { ListRowContextType, ManageListsContextType } from './ManageLists.types'

export const ListRowContext = React.createContext<ListRowContextType>({
  handleAcceptListUpdate: () => null,
  handleDisableList: () => null,
  handleEnableList: () => null,
  handleRemoveList: () => null,
  isActiveList: () => false,
  disableListInfo: false,
  listsByUrl: {}
})

export const ManageListsContext = React.createContext<ManageListsContextType>({
  addError: 'false',
  handleImport: () => null,
  handleInput: () => null,
  isImported: false,
  listUrlInput: '',
  renderableLists: [],
  tempList: undefined,
  disableListImport: false
})
