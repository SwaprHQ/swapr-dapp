import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { useAnalytics } from '../../analytics'
import { AdvancedDetailsFooter } from '../../components/AdvancedDetailsFooter'
import { BRIDGES } from '../../constants'
import { BridgeTransactionStatus, BridgeTransactionSummary } from '../../state/bridgeTransactions/types'
import { getExplorerLink } from '../../utils'
import { getNetworkInfo } from '../../utils/networksList'

import { BridgeStatusTag } from './BridgeStatusTag'

const Container = styled.div`
  display: flex;
  flex-flow: column;
`

const Body = styled.div`
  flex-flow: column;
  justify-content: space-between;
`

const Row = styled.div`
  display: flex;
  flex-flow: row;
  text-align: end;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.25rem 0rem;
  font-weight: 500;
  font-size: 0.825rem;
  color: ${({ theme }) => theme.text5};
`

const Header = styled(Row)`
  justify-content: space-evenly;
  line-height: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${props => props.theme.purple3};
`

const ColumnBridging = styled.div`
  width: 25%;
  text-align: start;
`

const ColumnFrom = styled.div`
  width: 20%;
`

const ColumnTo = styled.div`
  width: 35%;
`

const ColumnStatus = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 20%;
  margin: 0px 0px 0px 5px;
`

const ColumnToFlex = styled(ColumnTo)`
  display: flex;
  align-items: center;
`

const Link = styled.a`
  cursor: initial;
  color: ${props => props.theme.green2};

  &[href] {
    cursor: pointer;
  }

  &[href]:hover {
    text-decoration: underline;
  }
`

const Filler = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 0px 5px;
`

const Dots = styled.div<{ status: BridgeTransactionStatus }>`
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 50%;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme, status }) =>
    status === 'confirmed' || status === 'claimed'
      ? theme.green2
      : status === 'failed' || status === 'cancelled'
      ? theme.red2
      : theme.purple3};

  &:after {
    font-size: 14px;
    content: '\\00B7 \\00B7 \\00B7 \\00B7 \\00B7 \\00B7 \\00B7 \\00B7 \\00B7 \\00B7 \\00B7 \\00B7 \\00B7 \\00B7 \\00B7 \\00B7';
  }
`

const TextBridging = styled.div`
  font-size: 12px;
  line-height: 12px;
  color: ${props => props.theme.text1};
`

const TextFrom = styled.div`
  font-size: 10px;
  line-height: 12px;
  color: ${props => props.theme.text4};
`

const TextTo = styled(Link)<{ status: BridgeTransactionStatus }>`
  font-size: 10px;
  line-height: 12px;
  color: ${({ theme, status }) =>
    status === 'confirmed' || status === 'claimed'
      ? theme.green2
      : status === 'failed' || status === 'cancelled'
      ? theme.red2
      : theme.purple3};
`
interface BridgeTransactionsSummaryProps {
  transactions: BridgeTransactionSummary[]
  handleTriggerCollect: (tx: BridgeTransactionSummary) => void
  extraMargin: boolean
}

export const BridgeTransactionsSummary = ({
  transactions,
  handleTriggerCollect,
  extraMargin,
}: BridgeTransactionsSummaryProps) => {
  return (
    <AdvancedDetailsFooter style={extraMargin ? { marginTop: '10px' } : {}} fullWidth padding="12px">
      <Container>
        <Header>
          <ColumnBridging>Bridging</ColumnBridging>
          <ColumnFrom>From</ColumnFrom>
          <ColumnTo>To</ColumnTo>
          <ColumnStatus>Status</ColumnStatus>
        </Header>
        <Body>
          {Object.values(transactions).map((tx, index) => (
            <BridgeTransactionsSummaryRow key={index} tx={tx} handleTriggerCollect={handleTriggerCollect} />
          ))}
        </Body>
      </Container>
    </AdvancedDetailsFooter>
  )
}

interface BridgeTransactionsSummaryRowProps {
  tx: BridgeTransactionSummary
  handleTriggerCollect: BridgeTransactionsSummaryProps['handleTriggerCollect']
}

const BridgeTransactionsSummaryRow = ({ tx, handleTriggerCollect }: BridgeTransactionsSummaryRowProps) => {
  const analytics = useAnalytics()
  const { assetName, fromChainId, status, toChainId, fromValue, pendingReason, log, bridgeId } = tx
  const initialStatus = useRef(status)
  const fromChainName = fromChainId ? getNetworkInfo(fromChainId).name : ''
  const toChainName = toChainId ? getNetworkInfo(toChainId).name : ''

  const toLink =
    bridgeId === BRIDGES.SOCKET.id
      ? log[0] && log[1] && getExplorerLink(log[0].chainId, log[0].txHash, 'transaction', bridgeId)
      : log[1] && getExplorerLink(log[1].chainId, log[1].txHash, 'transaction', bridgeId)

  // track trade volume on first confirmation
  useEffect(() => {
    const isConfirmed = status === BridgeTransactionStatus.CONFIRMED || status === BridgeTransactionStatus.CLAIMED
    if (initialStatus.current !== status && isConfirmed) {
      analytics.trackEcoBridgeTradeVolume(tx)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStatus, status])

  return (
    <Row>
      <ColumnBridging data-testid="bridged-asset-name">
        <TextBridging>
          {fromValue} {assetName}
        </TextBridging>
      </ColumnBridging>
      <ColumnFrom data-testid="bridged-from-chain">
        <TextFrom>
          <Link
            href={getExplorerLink(log[0].chainId, log[0].txHash, 'transaction', bridgeId)}
            rel="noopener noreferrer"
            target="_blank"
          >
            {fromChainName}
          </Link>
        </TextFrom>
      </ColumnFrom>
      <ColumnToFlex data-testid="bridged-to-chain">
        <Filler>
          <Dots status={BridgeTransactionStatus.CONFIRMED} />
          <Dots status={status} />
        </Filler>
        <TextTo status={status} href={toLink} rel="noopener noreferrer" target="_blank">
          {toChainName}
        </TextTo>
      </ColumnToFlex>
      <ColumnStatus data-testid="status-tag">
        <BridgeStatusTag
          status={status}
          pendingReason={pendingReason}
          handleTriggerCollect={() => handleTriggerCollect(tx)}
        />
      </ColumnStatus>
    </Row>
  )
}
