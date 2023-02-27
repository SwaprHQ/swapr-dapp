export const REFETCH_DATA_INTERVAL = 15000

interface TransactionParams {
  from: string
  to: string
  value: string
  data: string
}

export const alchemyExectuionBundleOptions = (params: TransactionParams[]) => ({
  method: 'POST',
  headers: { accept: 'application/json', 'content-type': 'application/json' },
  body: JSON.stringify({
    id: 1,
    jsonrpc: '2.0',
    method: 'alchemy_simulateExecutionBundle',
    params: [params],
  }),
})
interface ApiResponse {
  jsonrpc: string
  id: number
  result: {
    calls: {
      type: string
      from: string
      to: string
      value: string
      gas: string
      gasUsed: string
      input: string
      output: string
      decoded?: {
        authority: string
        methodName: string
        inputs: {
          name: string
          value: string
          type: string
        }[]
        outputs: {
          name: string
          value: string
          type: string
        }[]
      }
    }[]
    logs: {
      address: string
      data: string
      topics: string[]
    }[]
  }[]
}

export const calucalateGasFromAlchemyResponse = async (response: Promise<Response>): Promise<number> => {
  const data = (await response).json() as Promise<ApiResponse>
  const awaitedData = await data
  const gasUsed = awaitedData.result.map(item => {
    return item.calls.reduce((sum, call) => {
      return sum + parseInt(call.gasUsed)
    }, 0)
  })

  const totalGasUsed = gasUsed.reduce((sum, value) => {
    return sum + value
  }, 0)

  return totalGasUsed
}
