import { vMainReservation } from ':modules/core/shared/lib/swagger/valibot.gen'
import * as v from 'valibot'

const reservationStatusServerSchema = vMainReservation.entries.status

/**
 *  FIXME Значения, которые приходят с бекенда, но в Swagger не указаны
 */
const reservationStatusManualSchema = v.picklist(['Отменен', 'Занял место', 'Вызвана'])

const reservationStatusSchema = v.union([reservationStatusServerSchema, reservationStatusManualSchema])

const reservationSchema = v.required(
  v.object({
    ...vMainReservation.entries,
    status: reservationStatusSchema,
    end_time: v.pipe(
      v.string(),
      v.toDate(),
    ),
  }),
)

export {
  reservationSchema,
}
