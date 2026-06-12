import type { InferInput, InferOutput } from 'valibot'
import type { restaurantSchema, restaurantZoneSchema } from './restaurant.validator'

export type RestaurantInput = InferInput<typeof restaurantSchema>

export type Restaurant = InferOutput<typeof restaurantSchema>

export type RestaurantZone = InferOutput<typeof restaurantZoneSchema>
