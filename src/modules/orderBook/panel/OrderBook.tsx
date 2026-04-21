import type { ReactNode } from 'react'

import { useSelectedSymbol } from '@/modules/market/state/SelectedSymbolProvider'
import { ErrorState } from '@/ui/feedback/ErrorState'
import { Spinner } from '@/ui/feedback/Spinner'
import { MatchQuery } from '@/ui/query/MatchQuery'

import { OrderBookAskSide } from '../book/OrderBookAskSide'
import { OrderBookBidSide } from '../book/OrderBookBidSide'
import { OrderBookColumnHeaders } from '../book/OrderBookColumnHeaders'
import { SpreadRow } from '../book/SpreadRow'
import { useOrderBookQuery } from '../data/useOrderBookQuery'
import { RatioBar } from '../ratio/RatioBar'
import { GroupedOrderBookProvider } from '../state/GroupedOrderBookProvider'

export const OrderBook = (): ReactNode => {
  const [symbol] = useSelectedSymbol()
  const query = useOrderBookQuery(symbol)

  return (
    <MatchQuery
      value={query}
      pending={() => <Spinner label="Connecting to Binance..." />}
      error={error => <ErrorState error={error} />}
      success={snapshot => (
        <GroupedOrderBookProvider snapshot={snapshot}>
          <OrderBookColumnHeaders />
          <OrderBookAskSide />
          <SpreadRow />
          <OrderBookBidSide />
          <RatioBar />
        </GroupedOrderBookProvider>
      )}
    />
  )
}
