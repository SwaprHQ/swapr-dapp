import { EXPEDITIONS_API_BASE_URL } from '../constants'
import { Configuration, ExpeditionsApi } from './generated'

const config = new Configuration({
  basePath: EXPEDITIONS_API_BASE_URL,
})

export const ExpeditionsAPI = new ExpeditionsApi(config)
