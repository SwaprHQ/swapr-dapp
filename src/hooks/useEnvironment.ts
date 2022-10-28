export function useEnvironment() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isStaging = process.env.REACT_APP_BUILD_ENV === 'staging'
  const isProduction = !(isDevelopment || isStaging) && process.env.NODE_ENV === 'production'

  return {
    isProduction,
    isDevelopment,
    isStaging,
  }
}
