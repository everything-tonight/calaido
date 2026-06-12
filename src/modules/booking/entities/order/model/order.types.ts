import type { InferInput, InferOutput } from 'valibot'
import type { orderSchema } from './order.validator'

export type OrderInput = InferInput<typeof orderSchema>

export type Order = InferOutput<typeof orderSchema>
