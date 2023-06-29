import {
  ApprovalsApi,
  BalancesApi,
  Configuration,
  QuoteApi,
  RoutesApi,
  ServerApi,
  SupportedApi,
  TokenListsApi,
} from './generated'

const config = new Configuration({
  basePath: 'https://api.socket.tech',
  middleware: [
    {
      pre: async ctx => {
        ctx.init.headers = {
          ...ctx.init.headers,
          'API-KEY': process.env.REACT_APP_SOCKET_API_KEY as string,
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
