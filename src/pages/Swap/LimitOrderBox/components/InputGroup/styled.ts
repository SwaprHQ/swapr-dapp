import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

export const StyledInnerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 12px 16px;
  gap: 10px;
  background: #1d202f;
  border-radius: 8px;
  position: relative;
`

export const StyledButtonAddonsWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
`

export const StyledButtonAddonsInnerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

export const StyledLabel = styled.label`
  font-weight: 600;
  font-size: 10px;
  line-height: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8c83c0;
  margin-bottom: 12px;
`

export const StyledInput = styled.input`
  width: 100%;
  flex-grow: 1;
  background: transparent;
  outline: none;
  border: none;
`
