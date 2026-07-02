<script setup lang="ts">
import type { RestaurantZone } from ':modules/booking/entities/restaurant'
import type { Booking } from '../model'

import { useRestaurantStore } from ':modules/booking/entities/restaurant/model/restaurant.store'
import BookingCalendar from ':modules/booking/widgets/booking-calendar/ui/BookingCalendar.vue'
import { useBookingFilters } from ':modules/booking/widgets/booking-filters'
import { useQuery } from '@pinia/colada'
import { useSeoMeta } from '@unhead/vue'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { getBookingService } from '../api/booking-get.service'

useSeoMeta({
  title: 'Бронирование',
})

const restaurantStore = useRestaurantStore()

const { restaurant, tables } = storeToRefs(restaurantStore)
const { setRestaurant, setTables } = restaurantStore

const {
  setAvailableDates,
  setAvailableZones,
} = useBookingFilters()

const { data } = useQuery({
  key: [restaurant.value.id, 'booking'],
  query: getBookingService,
})

function bootstrapBookingPage(booking: Booking | undefined) {
  if (booking) {
    setRestaurant({
      id: booking.restaurant.id,
      restaurant_name: booking.restaurant.restaurant_name,
      timezone: booking.restaurant.timezone,
      opening_time: booking.restaurant.opening_time,
      closing_time: booking.restaurant.closing_time,
    })

    setAvailableDates(booking.available_days)

    const collection = new Set<RestaurantZone>()

    for (const table of booking.tables) {
      collection.add(table.zone)
    }

    setAvailableZones(Array.from(collection))
    setTables(booking.tables)
  }
}

const cellDuration = ref(30)
const subCellDuration = ref(5)

watch(data, (booking) => {
  bootstrapBookingPage(booking)
})
</script>

<template>
  <div class="flex flex-col mx-5 grow min-h-0">
    <header class="mt-8">
      <h1 class="text-xl leading-7">
        Бронирование
      </h1>
    </header>

    <main class="flex flex-col grow min-h-0 overflow-hidden py-4">
      <div class="flex items-center gap-4 my-8">
        <label>
          <input v-model="cellDuration" type="range" min="10" max="60" step="5" class="w-20">
          <span>{{ cellDuration }}</span>
        </label>

        <label>
          <input v-model="subCellDuration" type="range" min="5" max="60" step="5" class="w-20">
          <span>{{ subCellDuration }}</span>
        </label>
      </div>

      <BookingCalendar
        :options="{
          timestampStart: restaurant.opening_time,
          timestampEnd: restaurant.closing_time,
          cellDuration,
          subCellDuration,
          direction: 'row',
          leftTimestampColumn: false,
          rightTimestampColumn: false,
        }"
        :items="tables.slice(0, 20)"
        :events="[]"
      >
        <template #item>
          <article class="w-40 h-40">
            Столик
          </article>
        </template>
      </BookingCalendar>
    </main>
  </div>
</template>
