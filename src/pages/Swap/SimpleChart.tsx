import { ColorType, createChart } from 'lightweight-charts'
import React, { useEffect, useRef } from 'react'

const chartColors = {
  backgroundColor: 'white',
  lineColor: '#2962FF',
  textColor: 'black',
  areaTopColor: '#2962FF',
  areaBottomColor: 'rgba(41, 98, 255, 0.28)',
}

const initialChartData = [
  { time: '2018-12-01', value: 32.51 },
  { time: '2018-12-02', value: 31.11 },
  { time: '2018-12-03', value: 27.02 },
  { time: '2018-12-04', value: 27.32 },
  { time: '2018-12-05', value: 25.17 },
  { time: '2018-12-06', value: 28.89 },
  { time: '2018-12-07', value: 25.46 },
  { time: '2018-12-08', value: 23.92 },
  { time: '2018-12-09', value: 22.68 },
  { time: '2018-12-10', value: 22.67 },
  { time: '2018-12-11', value: 27.57 },
  { time: '2018-12-12', value: 24.11 },
  { time: '2018-12-13', value: 30.74 },
]
// { data }: { data: Array }
const SimpleChart = () => {
  const chartRef = useRef<HTMLDivElement>(null)

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
        fontFamily: 'Inter var',
      },
      rightPriceScale: {
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        drawTicks: false,
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
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
      crosshair: {
        horzLine: {
          visible: false,
          labelVisible: false,
        },
        vertLine: {
          visible: true,
          style: 0,
          width: 2,
          color: '#505050',
          labelVisible: false,
        },
      },
    })
    chart.timeScale().fitContent()

    const newSeries = chart.addAreaSeries({
      lineColor: chartColors.lineColor,
      topColor: chartColors.areaTopColor,
      bottomColor: chartColors.areaBottomColor,
    })
    newSeries.setData(initialChartData)

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)

      chart.remove()
    }
  }, [])

  return <div ref={chartRef} />
}

export default SimpleChart
