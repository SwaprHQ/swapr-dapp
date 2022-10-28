import { useMedia } from 'react-use'

import { breakpoints } from '../utils/theme'

export const useIsDesktop = () => useMedia(`(min-width: ${breakpoints.l})`)
