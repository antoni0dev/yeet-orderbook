import type { ReactNode } from 'react'

import { useSelectedSymbol } from '@/modules/market/state/SelectedSymbolProvider'
import { Panel } from '@/ui/layout/Panel'

import { ControlsBar } from '../controls/ControlsBar'
import { OrderBookHeader } from '../header/OrderBookHeader'
import { defaultPriceStepFor } from '../logic/defaultPriceStepFor'
import { DepthModeProvider } from '../state/DepthModeProvider'
import { PriceStepProvider } from '../state/PriceStepProvider'
import { ShowRatioProvider } from '../state/ShowRatioProvider'
import { OrderBook } from './OrderBook'

export const OrderBookPage = (): ReactNode => {
  const [symbol] = useSelectedSymbol()
  return (
    <main className="mx-auto w-full max-w-md px-4 py-6">
      <Panel className="overflow-hidden">
        <OrderBookHeader />
        <PriceStepProvider key={symbol} initialValue={defaultPriceStepFor(symbol)}>
          <DepthModeProvider>
            <ShowRatioProvider>
              <ControlsBar />
              <OrderBook />
            </ShowRatioProvider>
          </DepthModeProvider>
        </PriceStepProvider>
      </Panel>
    </main>
  )
}
