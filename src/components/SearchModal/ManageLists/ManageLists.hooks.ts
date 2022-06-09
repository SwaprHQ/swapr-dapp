import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useToggle } from 'react-use'
import { TokenList } from '@uniswap/token-lists'
import { usePopper } from 'react-popper'
import { useDispatch, useSelector } from 'react-redux'

import { useOnClickOutside } from '../../../hooks/useOnClickOutside'
import { useActiveWeb3React } from '../../../hooks'
import { useFetchListCallback } from '../../../hooks/useFetchListCallback'
import { useActiveListUrls, useAllLists } from '../../../state/lists/hooks'
import { useActiveListsHandlers, useBridgeSupportedLists } from '../../../services/EcoBridge/EcoBridge.hooks'
import { acceptListUpdate, disableList, enableList, removeList } from '../../../state/lists/actions'

import uriToHttp from '../../../utils/uriToHttp'
import { ListRowContext } from './ManageLists.context'
import { parseENSAddress } from '../../../utils/parseENSAddress'
import { CurrencyModalView } from '../CurrencySearchModal'
import { AppState, AppDispatch } from '../../../state'
import { UNSUPPORTED_LIST_URLS } from '../../../constants/lists'
import { ListRowContextType, ListRowProps, ManageListsContextType, ManageListsProps } from './ManageLists.types'

export const useManageListsContextSwap = ({
  setListUrl,
  setModalView,
  setImportList,
}: ManageListsProps): ManageListsContextType => {
  const [listUrlInput, setListUrlInput] = useState<string>('')

  const lists = useAllLists()

  const handleInput = useCallback(e => {
    setListUrlInput(e.target.value)
  }, [])

  const fetchList = useFetchListCallback()

  const validUrl: boolean = useMemo(() => {
    return uriToHttp(listUrlInput).length > 0 || Boolean(parseENSAddress(listUrlInput))
  }, [listUrlInput])

  // temporary fetched list for import flow
  const [tempList, setTempList] = useState<TokenList>()
  const [addError, setAddError] = useState<string | undefined>()

  useEffect(() => {
    async function fetchTempList() {
      fetchList(listUrlInput, false)
        .then(list => setTempList(list))
        .catch(() => setAddError('Error importing list'))
    }
    // if valid url, fetch details for card
    if (validUrl) {
      fetchTempList()
    } else {
      setTempList(undefined)
      listUrlInput !== '' && setAddError('Enter valid list location')
    }

    // reset error
    if (listUrlInput === '') {
      setAddError(undefined)
    }
  }, [fetchList, listUrlInput, validUrl])

  // check if list is already imported
  const isImported = Object.keys(lists).includes(listUrlInput)

  // set list values and have parent modal switch to import list view
  const handleImport = useCallback(() => {
    if (!tempList) return
    setImportList(tempList)
    setModalView(CurrencyModalView.IMPORT_LIST)
    setListUrl(listUrlInput)
  }, [listUrlInput, setImportList, setListUrl, setModalView, tempList])

  const renderableLists = useMemo(() => {
    return Object.keys(lists).filter(listUrl => {
      // only show loaded lists, hide unsupported lists
      return Boolean(lists[listUrl].current) && !Boolean(UNSUPPORTED_LIST_URLS.includes(listUrl))
    })
  }, [lists])

  return {
    listUrlInput,
    handleInput,
    addError,
    tempList,
    isImported,
    handleImport,
    renderableLists,
    disableListImport: false,
  }
}

export const useManageListsContextBridge = (): ManageListsContextType => {
  const lists = useBridgeSupportedLists()

  const renderableLists = useMemo(() => {
    return Object.keys(lists).filter(listUrl => {
      return Boolean(lists[listUrl]) && !Boolean(UNSUPPORTED_LIST_URLS.includes(listUrl))
    })
  }, [lists])

  return {
    renderableLists,
    disableListImport: true,
  }
}

export const useListRowContextSwap = (): ListRowContextType => {
  const dispatch = useDispatch<AppDispatch>()
  const listsByUrl = useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)
  const activeListUrls = useActiveListUrls()

  const isActiveList = useCallback((listUrl: string) => Boolean(activeListUrls?.includes(listUrl)), [activeListUrls])

  const handleAcceptListUpdate = useCallback((listUrl: string) => dispatch(acceptListUpdate(listUrl)), [dispatch])
  const handleRemoveList = useCallback((listUrl: string) => dispatch(removeList(listUrl)), [dispatch])
  const handleEnableList = useCallback((listUrl: string) => dispatch(enableList(listUrl)), [dispatch])
  const handleDisableList = useCallback((listUrl: string) => dispatch(disableList(listUrl)), [dispatch])

  return {
    disableListInfo: false,
    listsByUrl,
    isActiveList,
    handleAcceptListUpdate,
    handleRemoveList,
    handleEnableList,
    handleDisableList,
  }
}

export const useListRowContextBridge = (): ListRowContextType => {
  const listsByUrl = useBridgeSupportedLists()

  const { activateList, deactivateList, isListActive: isActiveList } = useActiveListsHandlers()

  const handleAcceptListUpdate = () => null
  const handleRemoveList = () => null
  const handleEnableList = activateList
  const handleDisableList = deactivateList

  return {
    disableListInfo: true,
    listsByUrl,
    isActiveList,
    handleAcceptListUpdate,
    handleRemoveList,
    handleEnableList,
    handleDisableList,
  }
}

export const useListRow = ({ listUrl }: ListRowProps) => {
  const {
    listsByUrl,
    isActiveList,
    disableListInfo,
    handleRemoveList: handleRemoveListRaw,
    handleEnableList: handleEnableListRaw,
    handleDisableList: handleDisableListRaw,
    handleAcceptListUpdate: handleAcceptListUpdateRaw,
  } = useContext(ListRowContext)

  const { chainId } = useActiveWeb3React()
  const { current: list, pendingUpdate: pending } = listsByUrl[listUrl]

  const tokensAmountInCurrentChain = useMemo(() => {
    if (!list || list.tokens.length === 0 || !chainId) return 0
    return list.tokens.filter(token => token.chainId === chainId).length
  }, [chainId, list])

  const isActive = isActiveList(listUrl)

  const [open, toggle] = useToggle(false)
  const node = useRef<HTMLDivElement>()
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement>()
  const [popperElement, setPopperElement] = useState<HTMLDivElement>()

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'auto',
    strategy: 'fixed',
    modifiers: [{ name: 'offset', options: { offset: [8, 8] } }],
  })

  useOnClickOutside(node, open ? toggle : undefined)

  const handleAcceptListUpdate = useCallback(() => {
    if (!pending) return
    handleAcceptListUpdateRaw(listUrl)
  }, [handleAcceptListUpdateRaw, listUrl, pending])

  const handleRemoveList = useCallback(() => {
    if (window.prompt(`Please confirm you would like to remove this list by typing REMOVE`) === `REMOVE`) {
      handleRemoveListRaw(listUrl)
    }
  }, [handleRemoveListRaw, listUrl])

  const handleEnableList = useCallback(() => {
    handleEnableListRaw(listUrl)
  }, [handleEnableListRaw, listUrl])

  const handleDisableList = useCallback(() => {
    handleDisableListRaw(listUrl)
  }, [handleDisableListRaw, listUrl])

  return {
    node,
    open,
    list,
    styles,
    toggle,
    pending,
    isActive,
    attributes,
    listsByUrl,
    disableListInfo,
    setPopperElement,
    setReferenceElement,
    tokensAmountInCurrentChain,
    handleRemoveList,
    handleEnableList,
    handleDisableList,
    handleAcceptListUpdate,
  }
}
