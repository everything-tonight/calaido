import type * as v from 'valibot'
import type { bookingFiltersSchema } from './booking-filters.validator'

export interface BookingFiltersProps {
  availableDates: BookingFiltersFields['date'][]
  availableZones: BookingFiltersFields['zones']
}

export type BookingFiltersFields = v.InferOutput<typeof bookingFiltersSchema>
