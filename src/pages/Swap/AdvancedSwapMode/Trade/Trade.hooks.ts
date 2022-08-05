import { CSSProperties, useLayoutEffect, useState } from 'react'

enum SizeOfTrade {
  MIN = 1000,
  MAX = 100000,
}

export const useStylingTradeBackground = ({
  isSell,
  amountUSDNumber,
}: {
  amountUSDNumber: number
  isSell?: boolean
}) => {
  const [style, setStyle] = useState<CSSProperties>()

  useLayoutEffect(() => {
    const color = isSell ? '#f02e51' : '#0e9f6e'
    const background = isSell ? 'rgba(45, 24, 40, 0.5)' : 'rgb(20, 33, 36, 0.5)'

    if (amountUSDNumber < SizeOfTrade.MIN) {
      setStyle({
        background: `transparent`,
        color,
      })
      return
    }

    if (amountUSDNumber > SizeOfTrade.MAX) {
      setStyle({
        background,
        color,
      })
      return
    }

    const width = (100 - amountUSDNumber / SizeOfTrade.MIN).toFixed(0).toString()

    setStyle({
      background: `linear-gradient(to right, transparent ${width}%, ${background} ${width}% 100%)`,
      color,
    })
  }, [amountUSDNumber, isSell])

  return style
}
