import type * as v from 'valibot'
import type { bookingSchema } from './booking.validator'

export type BookingInput = v.InferInput<typeof bookingSchema>
export type Booking = v.InferOutput<typeof bookingSchema>
