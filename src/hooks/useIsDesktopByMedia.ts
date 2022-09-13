import { useMedia } from 'react-use'

import { breakpoints } from '../utils/theme'

export const useIsDesktopByMedia = () => useMedia(`(min-width: ${breakpoints.l})`)
