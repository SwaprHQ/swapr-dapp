const apiBaseURLDev = process.env.REACT_APP_SWAPR_API_BASE_URL || 'https://api-dev.swapr.site/v1.0'
const apiBaseURLProd = 'https://api.swapr.site/v1.0'

/**
 * Expeditions API base URL
 */
export const EXPEDITIONS_API_BASE_URL = process.env.NODE_ENV === 'production' ? apiBaseURLProd : apiBaseURLDev
