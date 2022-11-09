import { useTranslation } from 'react-i18next'

import { TYPE } from '../../theme'
import { AreaChartTokenPrice } from '../Charts/AreaChartTokenPrice'
import { ChartData } from '../Charts/chartUtils'
import { SimpleChartLoading } from './SimpleChartLoading'

interface ShowChartProps {
  data: ChartData[]
  loading: boolean
  tokenSymbol: string
  showHours: boolean
}

export const ShowChart = ({ loading, data, tokenSymbol, showHours }: ShowChartProps) => {
  const { t } = useTranslation('simpleChart')
  const hasData = data && data.length > 0

  return loading ? (
    <SimpleChartLoading />
  ) : hasData ? (
    <AreaChartTokenPrice data={data} tokenSymbol={tokenSymbol} showHours={showHours} />
  ) : (
    <TYPE.DarkGray textAlign="center">{t('pairNoData')}</TYPE.DarkGray>
  )
}
