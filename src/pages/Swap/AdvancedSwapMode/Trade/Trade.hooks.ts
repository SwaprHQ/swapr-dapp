import { CSSProperties, useLayoutEffect, useState } from 'react'
import { useTheme } from 'styled-components'

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
  const theme = useTheme()

  useLayoutEffect(() => {
    const color = isSell ? theme.red1 : theme.green2
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountUSDNumber, isSell])

  return style
}
