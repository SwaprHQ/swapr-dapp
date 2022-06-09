import React from 'react'
import { ListRowContextType, ManageListsContextType } from './ManageLists.types'

export const ListRowContext = React.createContext<ListRowContextType>({
  listsByUrl: {},
  disableListInfo: false,
  isActiveList: () => false,
  handleEnableList: () => null,
  handleRemoveList: () => null,
  handleDisableList: () => null,
  handleAcceptListUpdate: () => null,
})

export const ManageListsContext = React.createContext<ManageListsContextType>({
  addError: 'false',
  tempList: undefined,
  isImported: false,
  handleInput: () => null,
  listUrlInput: '',
  handleImport: () => null,
  renderableLists: [],
  disableListImport: false,
})
