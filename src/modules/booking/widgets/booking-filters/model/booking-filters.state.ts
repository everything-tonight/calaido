import type { PartialDeep } from 'type-fest'
import type { BookingFiltersFields } from './booking-filters.types'
import { isToday } from 'date-fns'
import { assign } from 'radashi'
import { computed, ref } from 'vue'

export function useBookingFilters() {
  const filters = ref<BookingFiltersFields>({
    date: new Date(),
    zones: [],
  })

  const availableDates = ref<BookingFiltersFields['date'][]>([])
  const availableZones = ref<BookingFiltersFields['zones']>([])

  const hasAvailableDates = computed<boolean>(() => {
    return availableDates.value.length > 0
  })

  const hasAvailableZones = computed<boolean>(() => {
    return availableZones.value.length > 0
  })

  const updateFilters = (newFilters: PartialDeep<BookingFiltersFields>): BookingFiltersFields => {
    const updatedFilters = assign(filters.value, newFilters) as BookingFiltersFields

    filters.value = updatedFilters

    return updatedFilters
  }

  const setAvailableDates = (newAvailableDates: BookingFiltersFields['date'][]) => {
    availableDates.value = newAvailableDates

    const todayDate = newAvailableDates.find(date => isToday(date))

    if (todayDate) {
      filters.value.date = todayDate
    }
  }

  const setAvailableZones = (newAvailableZones: BookingFiltersFields['zones']) => {
    availableZones.value = newAvailableZones
    filters.value.zones = newAvailableZones
  }

  return {
    filters,
    updateFilters,
    availableDates,
    setAvailableDates,
    availableZones,
    setAvailableZones,
    hasAvailableDates,
    hasAvailableZones,
  }
}
