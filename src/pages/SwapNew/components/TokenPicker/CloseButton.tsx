import styled from 'styled-components'

export function CloseButton() {
  return <Button></Button>
}

const Button = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border: 1px solid #2a2f42;
  background: rgba(60, 56, 100, 0.1);
  box-shadow: inset 0px 1.11185px 6.6711px rgba(165, 164, 255, 0.08),
    inset 6.6711px 2.2237px 11.1185px rgba(143, 141, 255, 0.1);
  backdrop-filter: blur(5px);
  cursor: pointer;
`
