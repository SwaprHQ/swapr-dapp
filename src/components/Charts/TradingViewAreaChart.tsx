import { createChart, UTCTimestamp } from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'
import { Box, Flex } from 'rebass'

import { TYPE } from '../../theme/index'
import { PricePercentualDifference } from './PricePercentualDifference'
import {
  buildDate,
  ChartData,
  formatDate,
  formatDateHours,
  formatDateShort,
  formatPrice,
  lastDataElement,
  lastElementTimeOrDefault,
  lastElementValueOrDefault,
} from './simpleChartUtils'

const chartColors = {
  backgroundColor: 'transparent',
  textColor: '#8780BF',
  lineColor: '#c8bdff',
  areaTopColor: 'rgba(255, 255, 255, 0.6)',
  areaBottomColor: 'rgba(204, 144, 255, 0)',
}

type TradingViewAreaChartProps = {
  data: ChartData[]
  tokenSymbol?: string
  showHours?: boolean
}

export const TradingViewAreaChart = ({ data, tokenSymbol, showHours }: TradingViewAreaChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [price, setPrice] = useState(lastElementValueOrDefault(data))
  const [date, setDate] = useState(buildDate(lastElementTimeOrDefault(data)))

  useEffect(() => {
    if (
      !chartRef ||
      !chartRef.current ||
      !chartRef.current.parentElement ||
      !chartRef.current.parentElement.clientWidth
    )
      return

    const chart = createChart(chartRef.current, {
      height: 248,
      width: chartRef.current.parentElement.clientWidth,
      layout: {
        backgroundColor: chartColors.backgroundColor,
        textColor: chartColors.textColor,
      },
      leftPriceScale: {
        visible: false,
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        fixLeftEdge: true,
        fixRightEdge: true,
        borderVisible: false,
        tickMarkFormatter: (time: UTCTimestamp) =>
          showHours ? formatDateHours(buildDate(time)) : formatDateShort(buildDate(time)),
      },
      watermark: {
        color: 'rgba(0, 0, 0, 0)',
      },
      grid: {
        horzLines: {
          visible: false,
        },
        vertLines: {
          visible: false,
        },
      },
      handleScale: {
        axisPressedMouseMove: false,
        pinch: false,
        mouseWheel: false,
      },
      crosshair: {
        horzLine: {
          visible: false,
          labelVisible: false,
        },
        vertLine: {
          visible: true,
          style: 0,
          width: 1,
          color: chartColors.lineColor,
          labelVisible: false,
        },
      },
    })

    const newSeries = chart.addAreaSeries({
      lineColor: chartColors.lineColor,
      topColor: chartColors.areaTopColor,
      bottomColor: chartColors.areaBottomColor,
      lineWidth: 3,
      priceLineVisible: false,
    })

    if (data && data.length > 0) {
      setPrice(lastElementValueOrDefault(data))
      setDate(buildDate(lastElementTimeOrDefault(data)))
      newSeries.setData(data)
    }
    chart.timeScale().fitContent()

    chart.subscribeCrosshairMove(function (param) {
      const currentPrice = param?.seriesPrices.get(newSeries) ?? lastDataElement(data)?.value ?? 0
      setPrice(currentPrice as string)
      const time = param?.time ? param?.time : lastDataElement(data)?.time ?? 0
      setDate(buildDate(time as UTCTimestamp))
    })

    const handleResize = () => {
      chart.timeScale().fitContent()
      if (chartRef?.current?.parentElement) {
        chart.applyOptions({ width: chartRef.current.parentElement.clientWidth })
        chart.timeScale().fitContent()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      setPrice('0')
      setDate(buildDate(lastElementTimeOrDefault(data)))
      chart.remove()
    }
  }, [data, showHours])

  return (
    <Flex flexDirection="column" alignItems="center" width="100%">
      <Box width="100%">
        <TYPE.DarkGray fontWeight={600} fontSize={30}>{`${formatPrice(price)} ${tokenSymbol}`}</TYPE.DarkGray>
        <Flex alignItems="center" mt="4px">
          <TYPE.Main fontSize={12} color="text4">
            {formatDate(date)}
          </TYPE.Main>
          <PricePercentualDifference firstValue={data[0].value} lastValue={lastElementValueOrDefault(data)} />
        </Flex>
      </Box>
      <div ref={chartRef} />
    </Flex>
  )
}
