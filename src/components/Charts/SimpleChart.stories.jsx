import { DAI, WETH } from '@swapr/sdk'

import { Flex } from 'rebass'

import { SimpleChart } from './SimpleChart'

const data = [
  {
    time: 1662486000,
    value: '1601.794376003465471685150261540348',
  },
  {
    time: 1662490200,
    value: '1578.683769390060178475980473812557',
  },
  {
    time: 1662491100,
    value: '1575.762172192810446717267291093502',
  },
  {
    time: 1662494400,
    value: '1575.355619427407286529672150282773',
  },
  {
    time: 1662500100,
    value: '1578.835799883877198590696485506083',
  },
  {
    time: 1662501600,
    value: '1579.248800100554447123987046737473',
  },
  {
    time: 1662502200,
    value: '1579.248800100554447123987046737473',
  },
  {
    time: 1662503700,
    value: '1579.248800100554447123987046737473',
  },
  {
    time: 1662511200,
    value: '1531.207805990304496667296723170274',
  },
  {
    time: 1662513900,
    value: '1533.880642428749749890375593982467',
  },
  {
    time: 1662517800,
    value: '1514.601988588982865906550499230396',
  },
  {
    time: 1662518100,
    value: '1514.601988588982865906550499230396',
  },
  {
    time: 1662523500,
    value: '1506.675183432894678612650126115599',
  },
  {
    time: 1662525000,
    value: '1507.078550885016159012479448412367',
  },
  {
    time: 1662536100,
    value: '1515.288894755500182345078681640809',
  },
]

export default {
  title: 'SimpleChart',
  component: SimpleChart,
}

//👇 We create a “template” of how args map to rendering
const Template = args => (
  <Flex bg="#251d41" p={5} width={['100%', '550px', '550px', '600px', '650px']}>
    <SimpleChart {...args} />
  </Flex>
)

//👇 Each story then reuses that template
export const SimpleChartTemplate = Template.bind({})

const currencies = { currency0: WETH[1], currency1: DAI[1] }

SimpleChartTemplate.args = {
  currency0: currencies.currency0,
  currency1: currencies.currency1,
  data: data,
  loading: false,
  setSelectedInterval: () => {},
  setIsCurrenciesSwitched: () => {},
  isCurrenciesSwitched: false,
}