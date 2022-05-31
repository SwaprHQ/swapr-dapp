import {
  Configuration,
  ServerApi,
  ApprovalsApi,
  QuoteApi,
  SupportedApi,
  BalancesApi,
  RoutesApi,
  TokenListsApi,
} from './generated'

const config = new Configuration({
  basePath: 'https://backend.movr.network',
  middleware: [
    {
      pre: async ctx => {
        ctx.init.headers = {
          ...ctx.init.headers,
          'API-KEY': 'f0211573-6dad-4a36-9a3a-f47012921a37',
        }
        return ctx
      },
    },
  ],
})

export const ServerAPI = new ServerApi(config)
export const ApprovalsAPI = new ApprovalsApi(config)
export const QuoteAPI = new QuoteApi(config)
export const SupportedAPI = new SupportedApi(config)
export const BalancesAPI = new BalancesApi(config)
export const RoutesAPI = new RoutesApi(config)
export const TokenListsAPI = new TokenListsApi(config)

export default {
  ServerAPI,
  ApprovalsAPI,
  QuoteAPI,
  SupportedAPI,
  BalancesAPI,
  RoutesAPI,
  TokenListsAPI,
}
