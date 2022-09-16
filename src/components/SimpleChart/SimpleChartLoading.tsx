import Skeleton from 'react-loading-skeleton'
import { Box, Flex } from 'rebass'

import { ReactComponent as ChartLoading } from '../../assets/images/chart-loading.svg'

export const SimpleChartLoading = () => {
  return (
    <Flex flexDirection="column" alignItems="center" width="100%">
      <Box width="100%">
        <Skeleton width="100px" height="30px" baseColor="#c8bdff" highlightColor="#8E89C6" />
        <Flex alignItems="center" mt={1}>
          <Skeleton width="80px" height="10px" baseColor="#c8bdff" highlightColor="#8E89C6" />
        </Flex>
        <ChartLoading />
      </Box>
    </Flex>
  )
}
