import { BarPrice, createChart, UTCTimestamp } from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'

import { ChartData } from '../../hooks/usePairTokenPriceByTimestamp'

const formatDateShort = (date: Date) => date.toLocaleString('default', { month: 'short' }) + ' ' + date.getDate()

const formatDate = (date: Date) =>
  `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`

const buildDate = (time: number) => new Date(time * 1000)

const chartColors = {
  backgroundColor: 'transparent',
  lineColor: '#C8BDFF',
  textColor: '#565A69',
  areaTopColor: 'rgba(255, 255, 255, 1)',
  areaBottomColor: 'rgba(204, 144, 255, 0)',
}

const lastDataElement = (data: ChartData[]) => data[data.length - 1]
const lastElementValueOrDefault = (data: ChartData[]) => lastDataElement(data)?.value ?? 0
const lastElementTimeOrDefault = (data: ChartData[]) => lastDataElement(data)?.time ?? 0

const SimpleChart = ({ data }: { data: ChartData[] }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [price, setPrice] = useState(lastElementValueOrDefault(data))
  const [date, setDate] = useState(formatDate(buildDate(lastElementTimeOrDefault(data))))

  useEffect(() => {
    if (
      !chartRef ||
      !chartRef.current ||
      !chartRef.current.parentElement ||
      !chartRef.current.parentElement.clientWidth
    )
      return

    const handleResize = () => {
      if (chartRef?.current?.parentElement)
        chart.applyOptions({ width: chartRef.current.parentElement.clientWidth, height: 200 })
    }

    const chart = createChart(chartRef.current, {
      height: 200,
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
      setDate(formatDate(buildDate(lastElementTimeOrDefault(data))))
      newSeries.setData(data)
    }

    chart.subscribeCrosshairMove(function (param) {
      const currentPrice = param?.seriesPrices.get(newSeries) ?? lastDataElement(data)?.value ?? 0
      setPrice(currentPrice as string)
      const time = param?.time ? param?.time : lastDataElement(data)?.time ?? 0
      setDate(formatDate(buildDate(time as UTCTimestamp)))
    })
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      setPrice('0')
      setDate(formatDate(buildDate(lastElementTimeOrDefault(data))))
      chart.remove()
    }
  }, [data])

  return (
    <Flex flexDirection="column" alignItems="center" width="100%">
      <Box width="100%">
        <BigPriceText>{price}</BigPriceText>
        <DateText>{date}</DateText>
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

export default SimpleChart
