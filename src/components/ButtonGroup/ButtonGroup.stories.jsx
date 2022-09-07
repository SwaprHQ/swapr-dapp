import { Box } from 'rebass'

import { ButtonGroup, ButtonGroupOption } from './ButtonGroup'

export default {
  title: 'ButtonGroup',
  component: ButtonGroup,
}

const Template = args => (
  <Box bg="#141524" p={5}>
    <ButtonGroup>
      <ButtonGroupOption {...args}>Chart</ButtonGroupOption>
      <ButtonGroupOption {...args}>Pro</ButtonGroupOption>
      <ButtonGroupOption {...args}>Off</ButtonGroupOption>
    </ButtonGroup>
  </Box>
)

export const ButtonGroupTemplate = Template.bind({})

ButtonGroupTemplate.args = {
  active: false,
}
