import { vMainOrder } from ':modules/core/shared/lib/swagger/valibot.gen'
import * as v from 'valibot'

export const orderSchema = v.required(
  v.object({
    ...vMainOrder.entries,
    start_time: v.pipe(
      v.string(),
      v.toDate(),
    ),
    end_time: v.pipe(
      v.string(),
      v.toDate(),
    ),
  }),
)
