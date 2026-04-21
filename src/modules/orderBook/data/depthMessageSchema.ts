import { z } from 'zod'

const priceQtyTuple = z.tuple([z.string(), z.string()])

export const depthMessageSchema = z.object({
  lastUpdateId: z.number(),
  bids: z.array(priceQtyTuple),
  asks: z.array(priceQtyTuple)
})
