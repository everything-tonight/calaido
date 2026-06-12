import { restaurantZoneSchema } from ':modules/booking/entities/restaurant'
import { vMainTable } from ':modules/core/shared/lib/swagger/valibot.gen'
import * as v from 'valibot'
import { orderSchema } from '../../order'
import { reservationSchema } from '../../reservation'

const tableSchema = v.required(
  v.object({
    ...vMainTable.entries,
    zone: restaurantZoneSchema,
    reservations: v.array(reservationSchema),
    orders: v.array(orderSchema),
  }),
)

export {
  tableSchema,
}
