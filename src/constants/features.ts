/**
 * Controls where the Chart feature is enabled. Can be enabled via environment variable
 */
export const REACT_APP_FEATURE_CHARTS = process.env.REACT_APP_FEATURE_CHARTS === 'true' || false
