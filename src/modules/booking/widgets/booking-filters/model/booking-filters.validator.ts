import { restaurantZoneSchema } from ':modules/booking/entities/restaurant'
import * as v from 'valibot'

const bookingFiltersSchema = v.object({
  date: v.pipe(
    v.date(),
    v.toString(),
    v.isoDateTime(),
    v.toDate(),
  ),
  zones: v.pipe(
    v.array(restaurantZoneSchema),
    v.minLength(1),
  ),
})

export {
  bookingFiltersSchema,
}
