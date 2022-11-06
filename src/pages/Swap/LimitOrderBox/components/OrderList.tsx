import { ChainId } from '@swapr/sdk'

import { Link } from 'react-router-dom'
import { Box } from 'rebass'

export interface OrderListProps {
  chainId: ChainId
  account: string
}

export function OrderList() {
  return (
    <Box
      sx={{ backgroundColor: '#2E17F2;', p: 2, borderRadius: 10, border: '1px solid blue', color: '#dadada', my: 2 }}
    >
      <Box display={'flex'}>
        <Link to="/account">Go to your orders</Link>
      </Box>
    </Box>
  )
}
