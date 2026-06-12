import type { Booking, BookingInput } from '../model/booking.types'
import { defaultHTTPClient } from ':modules/core/shared/lib/ofetch'
import { parse } from 'valibot'

import { bookingSchema } from '../model'

export async function getBookingService(): Promise<Booking | undefined> {
  try {
    const response = await defaultHTTPClient<BookingInput>('/booking')

    return parse(bookingSchema, response)
  }
  catch (error) {
    console.error(error)
  }
}
