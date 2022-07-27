import styled from 'styled-components'

export const ListTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.purple6};
`
export const ListTitleElement = styled.div`
  text-align: center;
  width: calc(100% / 3);
  padding: 0 0.5rem;
  color: ${({ theme }) => theme.purple3};
  font-size: 0.8rem;
  font-weight: 600;
`
