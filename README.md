# Yeet Order Book

A Binance-inspired live order book panel built for the Yeet Casino frontend challenge. Live bids and asks over WebSocket, selectable markets, price grouping, decimals that track the group step, show/hide buy-sell ratio, Amount vs Cumulative depth bars, Binance-style hover cascade, and row flash animations.

## Run

```sh
pnpm install
pnpm dev          # http://localhost:5174
```

## Scripts

| Command          | What it does                               |
| ---------------- | ------------------------------------------ |
| `pnpm dev`       | Vite dev server on port 5174               |
| `pnpm build`     | Typecheck + production build to `dist/`    |
| `pnpm preview`   | Serve the production bundle                |
| `pnpm typecheck` | `tsc --noEmit`                             |
| `pnpm lint`      | ESLint with flat config, run with `--fix`  |
| `pnpm test`      | Vitest (pure-logic unit tests)             |
| `pnpm knip`      | Dead-code / unused-export detection        |
| `pnpm format`    | Prettier write                             |
| `pnpm check`     | typecheck + lint + knip + test, all in one |

Node 22+. `pnpm` enforced via `packageManager` in `package.json`.

## Technology choices

- **Vite 8 + React 19** - SPA with one route, no SSR value; Vite's dev loop is faster than Next.js and the bundle is smaller. React 19's compiler-friendly model removes manual memoization from the equation.
- **TypeScript 6 (strict)** - strict mode, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noFallthroughCasesInSwitch`. Types are treated as source of truth.
- **Tailwind v4** - CSS-first `@theme` tokens in `src/index.css`, zero-config via `@tailwindcss/vite`. Used for layout and color tokens; flash animations are hand-rolled CSS keyframes.
- **TanStack Query v5** - the WebSocket-to-cache bridge uses React Query as the presentation-layer state holder. The initial query awaits the next snapshot, then live updates stream into the same cache entry; transport and parse failures can fail that query and are also logged by the stream layer.
- **zod 4** - schema validation on every WebSocket payload before it reaches domain mapping, so malformed frames fail fast instead of poisoning the live book.
- **Vitest 4 + happy-dom** - fast tests for the pure logic plus focused coverage around shared utilities, stream wiring, and small UI behaviors.
- **ESLint 10 flat config + typescript-eslint 8** - enforces `type` over `interface`, `react-compiler/react-compiler`, `react-hooks/exhaustive-deps`, `simple-import-sort`, unused-imports.
- **Knip 6** - fails the check pipeline on unused exports, files, or dependencies.
- **No Zustand** - every piece of shared state is panel-scoped; `setupStateProvider` / `setupValueProvider` keep state colocated with its UI subtree, which minimises re-render blast radius. Adding a store would be premature.
- **No diff-merging / no REST bootstrap** - the app consumes Binance's pre-sorted `@depth20@100ms` partial book stream. See "Assumptions".

## Architecture

```
buildStreamUrl({symbol, levels, speed})
  -> wss://stream.binance.com:9443/ws/<symbol>@depth20@100ms
createReconnectingSocket({url, onMessage, ...})         // auto-reconnect, backoff, visibilitychange pause
  -> { close }
createStreamManager<OrderBookSnapshot>({buildUrl, parse})// ref-counted subscribe API per channel
  -> subscribe(channel, handler) -> unsubscribe
  -> awaitNextMessage(channel, signal) -> Promise<OrderBookSnapshot>
parseDepthMessage(raw)                                  // validate every frame; string -> number mapping
  -> success(snapshot) | error(Error)
rafBatcher(flush)                                       // coalesces <=1 flush per frame
subscribeToOrderBook({symbol, onSnapshot, onError})     // composes everything above
useOrderBookQuery(symbol)                               // query waits for first snapshot; live stream updates cache and errors
  -> UseQueryResult<OrderBookSnapshot>
<MatchQuery value={query} pending={...} success={snap => ...} />
<GroupedOrderBookProvider snapshot={snap}>              // derives grouped+accumulated book via pure logic
  <OrderBookAskSide /> <SpreadRow /> <OrderBookBidSide /> <RatioBar />
```

### File layout

```
src/
├── lib/                         pure utilities (no React) + UI-adjacent state helpers
│   ├── assert/                  ensurePresent / shouldBePresent
│   ├── attempt/                 Result-style attempt() helper
│   ├── format/                  formatPrice, formatQty
│   ├── match/                   match() exhaustive dispatch
│   ├── math/                    roundToTick, decimalsForStep
│   ├── state/                   setupStateProvider, setupValueProvider
│   └── ws/                      createReconnectingSocket, createStreamManager, rafBatcher, backoff
├── ui/                          design-system primitives (no domain knowledge)
│   ├── feedback/                Spinner, ErrorState
│   ├── inputs/                  Select, Toggle, SegmentedControl
│   ├── layout/                  Stack (HStack), Panel
│   └── query/                   MatchQuery
└── modules/
    ├── market/                  symbol registry + per-symbol config
    │   ├── core.ts              supportedSymbols const + Symbol union
    │   ├── config.ts            tickSteps, qty decimals, display names per symbol
    │   └── state/SelectedSymbolProvider.tsx
    └── orderBook/               feature-organised, no generic components/ folder
        ├── core.ts, types.ts, config.ts
        ├── data/                buildStreamUrl, parseDepthMessage, subscribeToOrderBook, useOrderBookQuery
        ├── logic/               groupLevelsByTick, accumulateLevels, computeRatio, defaultPriceStepFor (pure + tested)
        ├── state/               PriceStepProvider, DepthModeProvider, ShowRatioProvider, HoveredRowProvider, GroupedOrderBookProvider
        ├── header/              OrderBookHeader, MarketSelector
        ├── controls/            ControlsBar, DepthModeSelector, PriceStepSelector, ShowRatioToggle
        ├── book/                OrderBookRow, OrderBookAskSide, OrderBookBidSide, OrderBookColumnHeaders, SpreadRow
        ├── ratio/               RatioBar
        └── panel/               OrderBookPage (top), OrderBook (MatchQuery host)
```

### Key senior-grade patterns

- **`<MatchQuery>` as the gate for query-backed UI.** The order-book screen avoids manual `if (isLoading)` branches; once the stream populates the cache, the success branch owns a typed snapshot with no ambiguity.
- **Component autonomy.** Domain components (rows, sides, ratio bar, spread) read state via hooks (`useSelectedSymbol`, `usePriceStep`, `useDepthMode`, `useHoveredRow`, `useGroupedOrderBook`) rather than prop-drilling. Only generic primitives like `<Select>` / `<SegmentedControl>` take props.
- **Symbol-change reset for free.** `<PriceStepProvider key={symbol} initialValue={defaultPriceStepFor(symbol)}>` uses React's key-based remount to reset the price-step selection whenever the market changes - no manual sync effect.
- **Ref-counted WebSocket streams.** Multiple components can subscribe to the same symbol through one shared WebSocket connection. Last unsubscribe tears the socket down. This matters if a future sidebar preview wants the same feed without opening a second connection.
- **RAF batching at the stream boundary.** Binance pushes 10 msg/s per connection; the batcher coalesces to at most one React Query `setQueryData` per animation frame. Older in-frame snapshots are discarded - meaningless for a top-N stream.
- **Real async error states.** The initial query now waits on the shared stream manager instead of a never-settling promise, so transport and parse failures can surface through `<MatchQuery>` and recover on later snapshots.
- **Visibilitychange pause.** Hidden tabs close the socket; becoming visible triggers an immediate reconnect. Prevents buffering useless updates in a backgrounded tab.
- **Pattern matching over branching.** `match()` and Record lookups replace switch/case and nested ternaries. The row's flash direction is a `Record<Side, Record<FlashDirection, FlashKind>>`, so adding a side or direction is a compile-time contract.
- **Pure logic in `logic/` with colocated tests.** Grouping, accumulation, ratio, rounding, parser validation, shared stream behavior, hover direction, and assertion helpers are covered by Vitest unit tests.
- **Fail-fast `ensurePresent`.** Context hooks and the React root pull-out are assertions, not optional chains.
- **No `useMemo` / `useCallback`.** The project targets React Compiler (enforced by `react-compiler/react-compiler: error` in ESLint). Natural code is the preferred input to the compiler.

## Interactions

- **Market selector** (top right) - BTC/USDT, ETH/USDT, SOL/USDT. Switching unsubscribes the old channel cleanly and opens a new one; `PriceStepProvider` remounts with the new default step.
- **Amount vs Cumulative** - segmented control; bar widths reflect per-level qty or running cumulative qty respectively.
- **Price step dropdown** - per-symbol tick groupings (BTC: 0.01 / 0.1 / 1 / 10 / 100, ETH: 0.01 / 0.1 / 1 / 10, SOL: 0.001 / 0.01 / 0.1 / 1). Bids floor to the step multiple, asks ceil - Binance semantics.
- **Ratio toggle** - show/hide the buy-sell ratio bar at the bottom.
- **Hover cascade** - hovering a row highlights that row and every row between it and the spread row, matching Binance's UX on both asks and bids. Side-level `onMouseLeave` clears the highlight to avoid flicker.
- **Row flash animations** - new rows flash neutral; updated rows flash green (bid-favouring) or red (ask-favouring). Implemented at the row boundary with `useRef` for previous qty and a remount key on a flash overlay so consecutive same-direction flashes reset properly.

## Assumptions

- **Stream choice**: the app uses the pre-sorted `<symbol>@depth20@100ms` partial book stream. That stream emits a full top-20-per-side snapshot every 100 ms, so no diff-merging, no REST bootstrap, and no sequence-number reconciliation are needed. The tradeoff: the client only ever sees 20 levels per side, so very coarse groupings (for example step = 1 on ETHUSDT) can collapse all 20 into 1-3 buckets. The diff stream (`@depth@100ms` + `/api/v3/depth` REST seed) would keep the full book and avoid that, at the cost of a sequence-number state machine. Out of scope for this challenge.
- **Tick-step options are hardcoded** per symbol in `modules/market/config.ts`. Production would fetch these from `/api/v3/exchangeInfo`.
- **Spread percent** formatting is fixed to 3 decimals. At BTCUSDT's $70k+ prices the displayed `0.000%` is accurate to that precision; tightening would need scientific notation, left for follow-up.
- **Only three markets** are exposed (BTC, ETH, SOL). The selector was designed to be trivial to extend - add to `supportedSymbols`, add a `marketConfigs` entry, done.
- **Desktop-first** layout at `max-w-md` (448 px). The panel is responsive down to around 360 px but isn't specifically tuned for mobile.
- **No authentication, no user state, no persistence.** Preferences reset on reload by design.

## Bonus challenges attempted

- Row flash animations (new / up / down).
- Hover cascade highlight.
- Amount vs Cumulative bar modes.
- Ratio bar toggle.
- Visibilitychange-driven WebSocket pause/resume.
- Exponential backoff reconnection with jitter.
- RAF batching so UI never renders faster than the browser paint loop.

## Deployment

Prepared for static SPA deployment such as Netlify:

```sh
pnpm build
# publish directory: dist/
# SPA fallback already in public/_redirects
```

## What to look at if you're reviewing

1. `src/modules/orderBook/data/useOrderBookQuery.ts` - the WebSocket-to-React-Query bridge.
2. `src/lib/ws/createReconnectingSocket.ts` and `createStreamManager.ts` - transport, reconnection, ref-counted subscribe API.
3. `src/modules/orderBook/logic/*` - pure domain logic with colocated unit tests.
4. `src/modules/orderBook/state/GroupedOrderBookProvider.tsx` - derivation pipeline from raw snapshot to display-ready grouped book.
5. `src/modules/orderBook/book/OrderBookRow.tsx` - leaf component that owns its own state dependencies, flash lifecycle, and hover-highlight logic.
