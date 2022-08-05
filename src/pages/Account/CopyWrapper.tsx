import { CheckCircle, Copy } from 'react-feather'
import { Box } from 'rebass'
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
  :hover,
  :active,
  :focus {
    text-decoration: none;
    color: ${({ theme }) => theme.text2};
  }
`

const TransactionStatus = styled.span`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
`

const TransactionStatusText = styled.span`
  color: ${({ theme }) => theme.text4};
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
        <TransactionStatus>
          <CustomCheckCircle size={'12'} />
          <TransactionStatusText>COPIED</TransactionStatusText>
        </TransactionStatus>
      ) : (
        <TransactionStatus>
          <CustomCopy size={'12'} />
        </TransactionStatus>
      )}
      {isCopied ? '' : <Box sx={{ ml: 1 }}>{label}</Box>}
    </Button>
  )
}
