import { CheckCircle, Copy } from 'react-feather'
import styled from 'styled-components'

import useCopyClipboard from '../../hooks/useCopyClipboard'
import { LinkStyledButton } from '../../theme'

const Button = styled(LinkStyledButton)`
  color: ${({ theme }) => theme.text4};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: inherit;
  min-width: 100px;
  padding: 0;
  :focus,
  :hover {
    text-decoration: none;
    color: ${({ theme }) => theme.text2};
  }
`

const Status = styled.span`
  display: flex;
  align-items: center;
`

const StatusText = styled.span`
  text-decoration: none;
  margin-left: 0.25rem;
  font-size: inherit;
`

const CustomCopy = styled(Copy)`
  color: ${({ theme }) => theme.text5};
`

const CustomCheckCircle = styled(CheckCircle)`
  color: ${({ theme }) => theme.text5};
`

export default function CopyWrapper({ value, label }: { value?: string | null; label?: string }) {
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <Button onClick={() => setCopied(value ?? '')}>
      {isCopied ? (
        <Status>
          <CustomCheckCircle size={'12'} />
          <StatusText>COPIED</StatusText>
        </Status>
      ) : (
        <Status>
          <CustomCopy size={'12'} />
          <StatusText>{label}</StatusText>
        </Status>
      )}
    </Button>
  )
}
