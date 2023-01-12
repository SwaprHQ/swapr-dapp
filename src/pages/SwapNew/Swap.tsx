import styled from 'styled-components'

export function Swapbox2() {
  return (
    <Container>
      <CurrencyItem />
      <CurrencyItem />
    </Container>
  )
}

const Container = styled.div`
  width: 467px;
`

const CurrencyItem = styled.div`
  width: 100%;
  height: 100px;
  background: radial-gradient(173.28% 128.28% at 50.64% 0%, rgba(170, 162, 255, 0.06) 0%, rgba(0, 0, 0, 0) 100%),
    rgba(19, 19, 32, 0.5);
  border-radius: 12px;
  border: 1.5px solid #1b1b2a;
`
