import { createChart, UTCTimestamp } from 'lightweight-charts'
import { useEffect, useRef } from 'react'
// import { useTheme } from 'styled-components'

import { ChartData } from '../../hooks/usePairTokenPriceByTimestamp'

const chartColors = {
  backgroundColor: 'white',
  lineColor: '#C8BDFF',
  textColor: 'black',
  areaTopColor: 'rgba(255, 255, 255, 1)',
  areaBottomColor: 'rgba(204, 144, 255, 0)',
}

const SimpleChart = ({ data }: { data: ChartData[] }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  // const theme = useTheme()

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
        tickMarkFormatter: (time: UTCTimestamp) => {
          const date = new Date(time * 1000)
          return date.toLocaleString('default', { month: 'short' }) + ' ' + date.getDate()
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
      // handleScroll: {
      //   mouseWheel: false,
      //   pressedMouseMove: false,
      //   horzTouchDrag: false,
      // },
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

    if (data && data.length > 0) newSeries.setData(data)

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)

      chart.remove()
    }
  }, [data])

  return <div ref={chartRef} />
}

export default SimpleChart
