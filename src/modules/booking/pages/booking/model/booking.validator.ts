import { restaurantSchema } from ':modules/booking/entities/restaurant/model/restaurant.validator'
import { tableSchema } from ':modules/booking/entities/table/model/table.validator'
import { vMainBookingResponse } from ':modules/core/shared/lib/swagger/valibot.gen'
import { parse } from 'date-fns'
import * as v from 'valibot'

const bookingSchema = v.required(
  v.object({
    ...vMainBookingResponse.entries,
    restaurant: restaurantSchema,
    available_days: v.array(
      v.pipe(
        v.string(),
        v.transform((input) => {
          return parse(input, 'yyyy-MM-dd', new Date())
        }),
      ),
    ),
    tables: v.array(tableSchema),
  }),
)

export {
  bookingSchema,
}
