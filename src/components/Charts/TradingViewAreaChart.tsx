import _Decimal from 'decimal.js-light'
import { createChart, UTCTimestamp } from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'
import { Box, Flex, Text } from 'rebass'
import styled, { useTheme } from 'styled-components'
import toFormat from 'toformat'

import { ChartData } from '../../hooks/usePairTokenPriceByTimestamp'

const Decimal = toFormat(_Decimal)

const formatDateShort = (date: Date) => date.toLocaleString('default', { month: 'short' }) + ' ' + date.getDate()

const formatDate = (date: Date) =>
  `${date.toLocaleString('default', {
    month: 'short',
  })} ${date.getDate()}, ${date.getFullYear()}  ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

const buildDate = (time: number) => new Date(time * 1000)

const chartColors = {
  backgroundColor: 'transparent',
  lineColor: 'rgba(200, 189, 255, 1)',
  textColor: 'rgba(135,128, 191, 1)',
  areaTopColor: 'rgba(255, 255, 255, 1)',
  areaBottomColor: 'rgba(204, 144, 255, 0)',
}

const lastDataElement = (data: ChartData[]) => data[data.length - 1]
const lastElementValueOrDefault = (data: ChartData[]) => lastDataElement(data)?.value ?? 0
const lastElementTimeOrDefault = (data: ChartData[]) => lastDataElement(data)?.time ?? 0

const formatPrice = (price: string) => {
  const floatPrice = parseFloat(price)
  const significantDigits = 6
  const format = { groupSeparator: '' }
  const quotient = new Decimal(floatPrice).toSignificantDigits(significantDigits)
  return quotient.toFormat(quotient.decimalPlaces(), format)
}

const TradingViewAreaChart = ({ data }: { data: ChartData[] }) => {
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

    const handleResize = () => {
      chart.timeScale().fitContent()
      if (chartRef?.current?.parentElement) {
        chart.applyOptions({ width: chartRef.current.parentElement.clientWidth })
      }
    }
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
        tickMarkFormatter: (time: UTCTimestamp) => formatDateShort(buildDate(time)),
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
    chart.timeScale().fitContent()

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

    chart.subscribeCrosshairMove(function (param) {
      const currentPrice = param?.seriesPrices.get(newSeries) ?? lastDataElement(data)?.value ?? 0
      setPrice(currentPrice as string)
      const time = param?.time ? param?.time : lastDataElement(data)?.time ?? 0
      setDate(buildDate(time as UTCTimestamp))
    })

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      setPrice('0')
      setDate(buildDate(lastElementTimeOrDefault(data)))
      chart.remove()
    }
  }, [data])

  return (
    <Flex flexDirection="column" alignItems="center" width="100%">
      <Box width="100%">
        <Flex alignItems="center">
          <BigPriceText>{formatPrice(price)}</BigPriceText>
          <PricePercentualDifference data={data} />
        </Flex>
        <DateText>{formatDate(date)}</DateText>
      </Box>
      <div ref={chartRef} />
    </Flex>
  )
}

const BigPriceText = styled.p`
  font-size: 36px;
  font-weight: 600;
  color: ${({ theme }) => theme.text3};

  margin-bottom: 4px;
`

const DateText = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.text4};
`

const PricePercentualDifference = ({ data }: { data: ChartData[] }) => {
  const theme = useTheme()

  const pricePercentualDifference = () =>
    (100 - (parseFloat(data[0].value) * 100) / parseFloat(lastDataElement(data).value)).toPrecision(3)

  const isPricePercentualDifferencePositive = () => parseFloat(pricePercentualDifference()) > 0
  const isPricePercentualDifferenceZero = () => parseFloat(pricePercentualDifference()) === 0

  const greenOrRed = () => (isPricePercentualDifferencePositive() ? theme.green1 : theme.red1)
  const correctColor = () => (isPricePercentualDifferenceZero() ? theme.gray1 : greenOrRed())
  const plusOrMinus = () => (isPricePercentualDifferencePositive() ? '+' : '-')
  const correctOperator = () => (isPricePercentualDifferenceZero() ? ' ' : plusOrMinus())

  const showPricePercentualDifference = () =>
    isPricePercentualDifferenceZero() ? '0%' : `${Math.abs(parseFloat(pricePercentualDifference()))}%`

  return (
    <Text color={correctColor()} ml={2}>
      {correctOperator()}
      {showPricePercentualDifference()}
    </Text>
  )
}

export default TradingViewAreaChart
