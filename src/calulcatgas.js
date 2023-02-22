//adds up all the gas from the alchemy_SimulateExecutionBundle json response
//https://docs.alchemy.com/reference/alchemy-simulateexecutionbundle this is api to play around with
const jsonGas = {
  jsonrpc: '2.0',
  id: 1,
  result: [
    {
      calls: [
        {
          decoded: {
            authority: 'ETHERSCAN',
            methodName: 'swapExactTokensForTokens',
            inputs: [
              {
                name: 'amountIn',
                value: '12000000',
                type: 'uint256',
              },
              {
                name: 'amountOutMin',
                value: '11887342037070066645',
                type: 'uint256',
              },
              {
                name: 'path',
                value:
                  '[0xdac17f958d2ee523a2206206994597c13d831ec7,0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2,0x6b175474e89094c44da98b954eedeac495271d0f]',
                type: 'address[]',
              },
              {
                name: 'to',
                value: '0x26358e62c2eded350e311bfde51588b8383a9315',
                type: 'address',
              },
              {
                name: 'deadline',
                value: '3354146696',
                type: 'uint256',
              },
            ],
            outputs: [
              {
                name: 'amounts',
                value: '[12000000,7276837845086172,11946511107416918690]',
                type: 'uint256[]',
              },
            ],
          },
          type: 'CALL',
          from: '0x26358e62c2eded350e311bfde51588b8383a9315',
          to: '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',
          value: '0x0',
          gas: '0x7fffffffffffa300',
          gasUsed: '0x248ee',
          input:
            '0x38ed17390000000000000000000000000000000000000000000000000000000000b71b00000000000000000000000000000000000000000000000000a4f85299d32133d500000000000000000000000000000000000000000000000000000000000000a000000000000000000000000026358e62c2eded350e311bfde51588b8383a931500000000000000000000000000000000000000000000000000000000c7ec37880000000000000000000000000000000000000000000000000000000000000003000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
          output:
            '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000b71b000000000000000000000000000000000000000000000000000019da3ed6d82fdc000000000000000000000000000000000000000000000000a5ca888e8ed80aa2',
        },
        {
          decoded: {
            authority: 'ETHERSCAN',
            methodName: 'getReserves',
            inputs: [],
            outputs: [
              {
                name: '_reserve0',
                value: '5949489985478334665210',
                type: 'uint112',
              },
              {
                name: '_reserve1',
                value: '9781667894969',
                type: 'uint112',
              },
              {
                name: '_blockTimestampLast',
                value: '1677072779',
                type: 'uint32',
              },
            ],
          },
          type: 'STATICCALL',
          from: '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',
          to: '0x06da0fd433c1a5d7a4faa01111c044910a184553',
          gas: '0x7dffffffffff92e0',
          gasUsed: '0x9d5',
          input: '0x0902f1ac',
          output:
            '0x00000000000000000000000000000000000000000000014285c2740b2c10d1fa000000000000000000000000000000000000000000000000000008e578d716b90000000000000000000000000000000000000000000000000000000063f6198b',
        },
        {
          decoded: {
            authority: 'ETHERSCAN',
            methodName: 'getReserves',
            inputs: [],
            outputs: [
              {
                name: '_reserve0',
                value: '3811223928470180982648683',
                type: 'uint112',
              },
              {
                name: '_reserve1',
                value: '2314514306527635680402',
                type: 'uint112',
              },
              {
                name: '_blockTimestampLast',
                value: '1677072083',
                type: 'uint32',
              },
            ],
          },
          type: 'STATICCALL',
          from: '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',
          to: '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
          gas: '0x7dffffffffff7788',
          gasUsed: '0x9d5',
          input: '0x0902f1ac',
          output:
            '0x00000000000000000000000000000000000000000003270edcf7a5d5d1ff6f6b00000000000000000000000000000000000000000000007d7856a2f6eb4bac920000000000000000000000000000000000000000000000000000000063f616d3',
        },
        {
          decoded: {
            authority: 'ETHERSCAN',
            methodName: 'transferFrom',
            inputs: [
              {
                name: '_from',
                value: '0x26358e62c2eded350e311bfde51588b8383a9315',
                type: 'address',
              },
              {
                name: '_to',
                value: '0x06da0fd433c1a5d7a4faa01111c044910a184553',
                type: 'address',
              },
              {
                name: '_value',
                value: '12000000',
                type: 'uint256',
              },
            ],
            outputs: [],
          },
          type: 'CALL',
          from: '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',
          to: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          value: '0x0',
          gas: '0x7dffffffffff5848',
          gasUsed: '0x67a2',
          input:
            '0x23b872dd00000000000000000000000026358e62c2eded350e311bfde51588b8383a931500000000000000000000000006da0fd433c1a5d7a4faa01111c044910a1845530000000000000000000000000000000000000000000000000000000000b71b00',
          output: '0x',
        },
        {
          decoded: {
            authority: 'ETHERSCAN',
            methodName: 'swap',
            inputs: [
              {
                name: 'amount0Out',
                value: '7276837845086172',
                type: 'uint256',
              },
              {
                name: 'amount1Out',
                value: '0',
                type: 'uint256',
              },
              {
                name: 'to',
                value: '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
                type: 'address',
              },
              {
                name: 'data',
                value: '0x',
                type: 'bytes',
              },
            ],
            outputs: [],
          },
          type: 'CALL',
          from: '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',
          to: '0x06da0fd433c1a5d7a4faa01111c044910a184553',
          value: '0x0',
          gas: '0x7dfffffffffee318',
          gasUsed: '0xbdef',
          input:
            '0x022c0d9f0000000000000000000000000000000000000000000000000019da3ed6d82fdc0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c3d03e4f041fd4cd388c549ee2a29a9e5075882f00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000',
          output: '0x',
        },
        {
          type: 'CALL',
          from: '0x06da0fd433c1a5d7a4faa01111c044910a184553',
          to: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          value: '0x0',
          gas: '0x7c07fffffffeb2c0',
          gasUsed: '0x323e',
          input:
            '0xa9059cbb000000000000000000000000c3d03e4f041fd4cd388c549ee2a29a9e5075882f0000000000000000000000000000000000000000000000000019da3ed6d82fdc',
          output: '0x0000000000000000000000000000000000000000000000000000000000000001',
        },
        {
          type: 'STATICCALL',
          from: '0x06da0fd433c1a5d7a4faa01111c044910a184553',
          to: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          gas: '0x7c07fffffffe83e0',
          gasUsed: '0x216',
          input: '0x70a0823100000000000000000000000006da0fd433c1a5d7a4faa01111c044910a184553',
          output: '0x00000000000000000000000000000000000000000000014285a899cc5538a21e',
        },
        {
          decoded: {
            authority: 'ETHERSCAN',
            methodName: 'balanceOf',
            inputs: [
              {
                name: 'who',
                value: '0x06da0fd433c1a5d7a4faa01111c044910a184553',
                type: 'address',
              },
            ],
            outputs: [
              {
                name: '',
                value: '9781679894969',
                type: 'uint256',
              },
            ],
          },
          type: 'STATICCALL',
          from: '0x06da0fd433c1a5d7a4faa01111c044910a184553',
          to: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          gas: '0x7c07fffffffe7ff8',
          gasUsed: '0x407',
          input: '0x70a0823100000000000000000000000006da0fd433c1a5d7a4faa01111c044910a184553',
          output: '0x000000000000000000000000000000000000000000000000000008e5798e31b9',
        },
        {
          decoded: {
            authority: 'ETHERSCAN',
            methodName: 'swap',
            inputs: [
              {
                name: 'amount0Out',
                value: '11946511107416918690',
                type: 'uint256',
              },
              {
                name: 'amount1Out',
                value: '0',
                type: 'uint256',
              },
              {
                name: 'to',
                value: '0x26358e62c2eded350e311bfde51588b8383a9315',
                type: 'address',
              },
              {
                name: 'data',
                value: '0x',
                type: 'bytes',
              },
            ],
            outputs: [],
          },
          type: 'CALL',
          from: '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',
          to: '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
          value: '0x0',
          gas: '0x7dfffffffffe23b0',
          gasUsed: '0xbd16',
          input:
            '0x022c0d9f000000000000000000000000000000000000000000000000a5ca888e8ed80aa2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000026358e62c2eded350e311bfde51588b8383a931500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000',
          output: '0x',
        },
        {
          decoded: {
            authority: 'ETHERSCAN',
            methodName: 'transfer',
            inputs: [
              {
                name: 'dst',
                value: '0x26358e62c2eded350e311bfde51588b8383a9315',
                type: 'address',
              },
              {
                name: 'wad',
                value: '11946511107416918690',
                type: 'uint256',
              },
            ],
            outputs: [
              {
                name: '',
                value: 'true',
                type: 'bool',
              },
            ],
          },
          type: 'CALL',
          from: '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
          to: '0x6b175474e89094c44da98b954eedeac495271d0f',
          value: '0x0',
          gas: '0x7c07fffffffdf740',
          gasUsed: '0x3312',
          input:
            '0xa9059cbb00000000000000000000000026358e62c2eded350e311bfde51588b8383a9315000000000000000000000000000000000000000000000000a5ca888e8ed80aa2',
          output: '0x0000000000000000000000000000000000000000000000000000000000000001',
        },
        {
          decoded: {
            authority: 'ETHERSCAN',
            methodName: 'balanceOf',
            inputs: [
              {
                name: '',
                value: '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
                type: 'address',
              },
            ],
            outputs: [
              {
                name: '',
                value: '3811211981959073565729993',
                type: 'uint256',
              },
            ],
          },
          type: 'STATICCALL',
          from: '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
          to: '0x6b175474e89094c44da98b954eedeac495271d0f',
          gas: '0x7c07fffffffdc090',
          gasUsed: '0x25a',
          input: '0x70a08231000000000000000000000000c3d03e4f041fd4cd388c549ee2a29a9e5075882f',
          output: '0x00000000000000000000000000000000000000000003270e372d1d47432764c9',
        },
        {
          type: 'STATICCALL',
          from: '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
          to: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          gas: '0x7c07fffffffdbca8',
          gasUsed: '0x216',
          input: '0x70a08231000000000000000000000000c3d03e4f041fd4cd388c549ee2a29a9e5075882f',
          output: '0x00000000000000000000000000000000000000000000007d78707d35c223dc6e',
        },
      ],
      logs: [
        {
          decoded: {
            authority: 'ETHERSCAN',
            eventName: 'Transfer',
            inputs: [
              {
                name: 'from',
                value: '0x26358e62c2eded350e311bfde51588b8383a9315',
                type: 'address',
                indexed: true,
              },
              {
                name: 'to',
                value: '0x06da0fd433c1a5d7a4faa01111c044910a184553',
                type: 'address',
                indexed: true,
              },
              {
                name: 'value',
                value: '12000000',
                type: 'uint256',
                indexed: false,
              },
            ],
          },
          address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          data: '0x0000000000000000000000000000000000000000000000000000000000b71b00',
          topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            '0x26358e62c2eded350e311bfde51588b8383a9315',
            '0x6da0fd433c1a5d7a4faa01111c044910a184553',
          ],
        },
        {
          address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          data: '0x0000000000000000000000000000000000000000000000000019da3ed6d82fdc',
          topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            '0x6da0fd433c1a5d7a4faa01111c044910a184553',
            '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
          ],
        },
        {
          decoded: {
            authority: 'ETHERSCAN',
            eventName: 'Sync',
            inputs: [
              {
                name: 'reserve0',
                value: '5949482708640489579038',
                type: 'uint112',
                indexed: false,
              },
              {
                name: 'reserve1',
                value: '9781679894969',
                type: 'uint112',
                indexed: false,
              },
            ],
          },
          address: '0x06da0fd433c1a5d7a4faa01111c044910a184553',
          data: '0x00000000000000000000000000000000000000000000014285a899cc5538a21e000000000000000000000000000000000000000000000000000008e5798e31b9',
          topics: ['0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1'],
        },
        {
          decoded: {
            authority: 'ETHERSCAN',
            eventName: 'Swap',
            inputs: [
              {
                name: 'sender',
                value: '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',
                type: 'address',
                indexed: true,
              },
              {
                name: 'to',
                value: '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
                type: 'address',
                indexed: true,
              },
              {
                name: 'amount0In',
                value: '0',
                type: 'uint256',
                indexed: false,
              },
              {
                name: 'amount1In',
                value: '12000000',
                type: 'uint256',
                indexed: false,
              },
              {
                name: 'amount0Out',
                value: '7276837845086172',
                type: 'uint256',
                indexed: false,
              },
              {
                name: 'amount1Out',
                value: '0',
                type: 'uint256',
                indexed: false,
              },
            ],
          },
          address: '0x06da0fd433c1a5d7a4faa01111c044910a184553',
          data: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b71b000000000000000000000000000000000000000000000000000019da3ed6d82fdc0000000000000000000000000000000000000000000000000000000000000000',
          topics: [
            '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
            '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',
            '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
          ],
        },
        {
          decoded: {
            authority: 'ETHERSCAN',
            eventName: 'Transfer',
            inputs: [
              {
                name: 'src',
                value: '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
                type: 'address',
                indexed: true,
              },
              {
                name: 'dst',
                value: '0x26358e62c2eded350e311bfde51588b8383a9315',
                type: 'address',
                indexed: true,
              },
              {
                name: 'wad',
                value: '11946511107416918690',
                type: 'uint256',
                indexed: false,
              },
            ],
          },
          address: '0x6b175474e89094c44da98b954eedeac495271d0f',
          data: '0x000000000000000000000000000000000000000000000000a5ca888e8ed80aa2',
          topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
            '0x26358e62c2eded350e311bfde51588b8383a9315',
          ],
        },
        {
          decoded: {
            authority: 'ETHERSCAN',
            eventName: 'Sync',
            inputs: [
              {
                name: 'reserve0',
                value: '3811211981959073565729993',
                type: 'uint112',
                indexed: false,
              },
              {
                name: 'reserve1',
                value: '2314521583365480766574',
                type: 'uint112',
                indexed: false,
              },
            ],
          },
          address: '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
          data: '0x00000000000000000000000000000000000000000003270e372d1d47432764c900000000000000000000000000000000000000000000007d78707d35c223dc6e',
          topics: ['0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1'],
        },
        {
          decoded: {
            authority: 'ETHERSCAN',
            eventName: 'Swap',
            inputs: [
              {
                name: 'sender',
                value: '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',
                type: 'address',
                indexed: true,
              },
              {
                name: 'to',
                value: '0x26358e62c2eded350e311bfde51588b8383a9315',
                type: 'address',
                indexed: true,
              },
              {
                name: 'amount0In',
                value: '0',
                type: 'uint256',
                indexed: false,
              },
              {
                name: 'amount1In',
                value: '7276837845086172',
                type: 'uint256',
                indexed: false,
              },
              {
                name: 'amount0Out',
                value: '11946511107416918690',
                type: 'uint256',
                indexed: false,
              },
              {
                name: 'amount1Out',
                value: '0',
                type: 'uint256',
                indexed: false,
              },
            ],
          },
          address: '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
          data: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000019da3ed6d82fdc000000000000000000000000000000000000000000000000a5ca888e8ed80aa20000000000000000000000000000000000000000000000000000000000000000',
          topics: [
            '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
            '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',
            '0x26358e62c2eded350e311bfde51588b8383a9315',
          ],
        },
      ],
    },
  ],
}

const gasUsed = jsonGas.result.map(item => {
  return item.calls.reduce((sum, call) => {
    console.log('gasUsed', parseInt(call.gasUsed))
    return sum + parseInt(call.gasUsed)
  }, 0)
})
console.log('gasUsed', gasUsed)

const totalGasUsed = gasUsed.reduce((sum, value) => {
  return sum + value
}, 0)

console.log(totalGasUsed)
