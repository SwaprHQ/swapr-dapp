import { createContext } from 'react'

import { ListRowContextType, ManageListsContextType } from './ManageLists.types'

export const ListRowContext = createContext<ListRowContextType>({
  listsByUrl: {},
  disableListInfo: false,
  isActiveList: () => false,
  handleEnableList: () => null,
  handleRemoveList: () => null,
  handleDisableList: () => null,
  handleAcceptListUpdate: () => null,
})

export const ManageListsContext = createContext<ManageListsContextType>({
  addError: 'false',
  tempList: undefined,
  isImported: false,
  handleInput: () => null,
  listUrlInput: '',
  handleImport: () => null,
  renderableLists: [],
  disableListImport: false,
})
