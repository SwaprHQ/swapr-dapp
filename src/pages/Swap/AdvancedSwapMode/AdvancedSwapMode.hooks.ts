import { useParsedQueryString } from '../../../hooks/useParsedQueryString'

export const useCheckIsAdvTradeViewFlagOn = () => {
  const { advTrade: advTradeSwitchOnFlag } = useParsedQueryString()

  return advTradeSwitchOnFlag === '1'
}
