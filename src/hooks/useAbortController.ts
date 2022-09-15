import { useCallback, useRef } from 'react'

export function useAbortController() {
  const abortControllerRef = useRef<AbortController>()
  const getAbortController = useCallback<() => AbortController>(() => {
    if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController()
    }
    return abortControllerRef.current
  }, [])

  const setNewAbortController = useCallback<() => void>(() => {
    abortControllerRef.current = new AbortController()
  }, [])

  return [getAbortController, setNewAbortController] as [() => AbortController, () => void]
}
