import type * as v from 'valibot'
import type { tableSchema } from './table.validator'

export type TableInput = v.InferInput<typeof tableSchema>
export type Table = v.InferOutput<typeof tableSchema>
