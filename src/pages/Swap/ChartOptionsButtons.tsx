import { ButtonGroup, ButtonGroupOption } from '../../components/ButtonGroup/ButtonGroup'
import { ChartOptions } from '../../state/user/reducer'

interface ChartOptionsButtonsProps {
  hasBothCurrenciesInput: boolean
  selectedChartOption: number | undefined
  setselectedChartOption: Function
}

export function ChartOptionsButtons({
  hasBothCurrenciesInput,
  selectedChartOption,
  setselectedChartOption,
}: ChartOptionsButtonsProps) {
  return (
    <ButtonGroup mb={[3, 0]}>
      <ButtonGroupOption
        disabled={!hasBothCurrenciesInput}
        active={selectedChartOption === ChartOptions.SIMPLE_CHART}
        onClick={() => setselectedChartOption(ChartOptions.SIMPLE_CHART)}
      >
        Chart
      </ButtonGroupOption>
      <ButtonGroupOption
        disabled={!hasBothCurrenciesInput}
        active={selectedChartOption === ChartOptions.OFF}
        onClick={() => setselectedChartOption(ChartOptions.OFF)}
      >
        Off
      </ButtonGroupOption>
    </ButtonGroup>
  )
}
