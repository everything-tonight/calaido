<script setup lang="ts">
import type { BookingFiltersFields, BookingFiltersProps } from '../model/booking-filters.types.ts'
import BookingDateFilter from './BookingDateFilter.vue'
import BookingZoneFilter from './BookingZoneFilter.vue'

defineProps<BookingFiltersProps>()

const filters = defineModel<BookingFiltersFields>({
  required: true,
})
</script>

<template>
  <article class="flex flex-col gap-4">
    <BookingDateFilter
      v-model="filters.date"
      :available-dates
    />
    <BookingZoneFilter
      v-model="filters.zones"
      :available-zones
    />
  </article>
</template>
