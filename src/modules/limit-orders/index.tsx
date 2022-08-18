import { Form } from './components/Form'
import { OrderList } from './components/OrderList/OrderList'

/**
 * Re-export the constants
 */
export * from './constants'

/**
 * Re-export the main app entry
 */
export * from './app'

/**
 *
 */
export * from './api'

/**
 * Module name
 */
const name = 'limit-orders'

/**
 * Module version
 */
const version = '0.1.0'

/**
 * Registered component names
 */
enum ComponentName {
  OrderList = 'OrderList',
}

/**
 * Registered components for this module
 */
const components: Record<ComponentName, typeof Form | typeof OrderList> = {
  [ComponentName.OrderList]: OrderList,
}

export { name, version, components, ComponentName }
