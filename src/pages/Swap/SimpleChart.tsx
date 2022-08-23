import { setDate } from 'date-fns'
import { BusinessDay, createChart, UTCTimestamp } from 'lightweight-charts'
import React, { useEffect, useRef, useState } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
// import { useTheme } from 'styled-components'

const chartColors = {
  backgroundColor: 'white',
  lineColor: '#C8BDFF',
  textColor: 'black',
  areaTopColor: 'rgba(255, 255, 255, 1)',
  areaBottomColor: 'rgba(204, 144, 255, 0)',
}

const data = [
  { time: '2019-04-22', value: 77.4 },
  { time: '2019-04-23', value: 78.2 },
  { time: '2019-04-24', value: 78.68 },
  { time: '2019-04-25', value: 78.66 },
  { time: '2019-04-26', value: 77.88 },
  { time: '2019-04-29', value: 78.02 },
  { time: '2019-04-30', value: 78.68 },
  { time: '2019-05-02', value: 78.14 },
  { time: '2019-05-03', value: 78.3 },
  { time: '2019-05-06', value: 80.06 },
  { time: '2019-05-07', value: 80.5 },
  { time: '2019-05-08', value: 80.76 },
  { time: '2019-05-10', value: 82.1 },
  { time: '2019-05-13', value: 83.72 },
  { time: '2019-05-14', value: 83.55 },
  { time: '2019-05-15', value: 84.92 },
  { time: '2019-05-16', value: 83.32 },
  { time: '2019-05-17', value: 83.04 },
  { time: '2019-05-20', value: 83.92 },
  { time: '2019-05-21', value: 84.24 },
  { time: '2019-05-22', value: 84.0 },
  { time: '2019-05-23', value: 84.26 },
  { time: '2019-05-24', value: 84.0 },
  { time: '2019-05-27', value: 83.8 },
  { time: '2019-05-28', value: 84.32 },
  { time: '2019-05-29', value: 83.88 },
  { time: '2019-05-30', value: 84.58 },
  { time: '2019-05-31', value: 81.2 },
  { time: '2019-06-03', value: 84.35 },
  { time: '2019-06-04', value: 85.66 },
  { time: '2019-06-05', value: 86.51 },
]
//  add missing types
const buildDate = time => {
  const date = new Date(time.year, time.month, time.day)
  return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`
}

//  will change to timestamp when we connect real data
const buildDateFromTimestamp = timestamp => {
  const date = new Date(timestamp)
  return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`
}
// { data }: { data: Array }
const SimpleChart = () => {
  const chartRef = useRef<HTMLDivElement>(null)
  const lastDataElement = data[data.length - 1]
  const lastDataElementValue = lastDataElement.value
  const lastDataElementTime = lastDataElement.time

  const [price, setPrice] = useState(lastDataElementValue)
  const [date, setDate] = useState(buildDateFromTimestamp(lastDataElementTime))

  useEffect(() => {
    if (
      !chartRef ||
      !chartRef.current ||
      !chartRef.current.parentElement ||
      !chartRef.current.parentElement.clientWidth
    )
      return
    const handleResize = () => {
      chart.applyOptions({ width: 300, height: 200 })
    }

    const chart = createChart(chartRef.current, {
      height: 300,
      width: chartRef.current.parentElement.clientWidth - 32,
      layout: {
        backgroundColor: 'transparent',
        textColor: '#565A69',
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
        tickMarkFormatter: (time: BusinessDay) => {
          const date = new Date(time.year, time.month, time.day)
          return date.toLocaleString('default', { month: 'short' }) + '-' + date.getDate()
        },
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
    newSeries.setData(data)
    chart.subscribeCrosshairMove(function (param) {
      const time = param?.time ? buildDate(param?.time) : buildDateFromTimestamp(lastDataElementTime)
      const price = param?.seriesPrices.get(newSeries) ?? lastDataElementValue
      setPrice(price)
      setDate(time)
    })
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)

      chart.remove()
    }
  }, [])

  return (
    <Flex flexDirection="column" alignItems="center" width="100%">
      <Flex justifyContent="space-between" width="100%" px={4}>
        <div>
          <BigPriceText>{price}</BigPriceText>
          <DateText>{date}</DateText>
        </div>
        <p>date filters</p>
      </Flex>
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
