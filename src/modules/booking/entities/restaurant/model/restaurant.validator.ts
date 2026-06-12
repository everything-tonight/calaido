import { vMainRestaurant, vMainZone } from ':modules/core/shared/lib/swagger/valibot.gen'
import { parse } from 'date-fns'
import * as v from 'valibot'

const restaurantZoneServerSchema = vMainZone

/**
 *  FIXME Значения, которые приходят с бекенда, но в Swagger не указаны
 */
const restaurantZoneManualSchema = v.picklist(['1 Этаж', '2 Этаж'])

const restaurantZoneSchema = v.union([restaurantZoneServerSchema, restaurantZoneManualSchema])

const restaurantSchema = v.required(
  v.object({
    ...vMainRestaurant.entries,
    opening_time: v.pipe(
      v.string(),
      v.transform((input) => {
        return parse(input, 'HH:mm', new Date())
      }),
    ),
    closing_time: v.pipe(
      v.string(),
      v.transform((input) => {
        return parse(input, 'HH:mm', new Date())
      }),
    ),
  }),
)

export {
  restaurantSchema,
  restaurantZoneSchema,
}
