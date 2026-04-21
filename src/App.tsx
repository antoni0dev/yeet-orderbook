import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { SelectedSymbolProvider } from './modules/market/state/SelectedSymbolProvider'
import { OrderBookPage } from './modules/orderBook/panel/OrderBookPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
      gcTime: 0
    }
  }
})

export const App = (): ReactNode => (
  <QueryClientProvider client={queryClient}>
    <SelectedSymbolProvider>
      <OrderBookPage />
    </SelectedSymbolProvider>
  </QueryClientProvider>
)
