import type { InferInput, InferOutput } from 'valibot'
import type { reservationSchema } from './reservation.validator'

export type ReservationInput = InferInput<typeof reservationSchema>

export type Reservation = InferOutput<typeof reservationSchema>
