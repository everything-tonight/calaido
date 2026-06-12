<script setup lang="ts">
import type { BookingFiltersProps } from '../model'
import { format, isToday, isTomorrow } from 'date-fns'
import { ru } from 'date-fns/locale'

defineProps<Pick<BookingFiltersProps, 'availableDates'>>()

const selectedDate = defineModel<Date>({
  required: true,
})

function getRelativeDay(date: Date) {
  if (isToday(date))
    return 'Сегодня'
  if (isTomorrow(date))
    return 'Завтра'

  return format(date, 'eeee', { locale: ru })
}
</script>

<template>
  <form v-if="availableDates.length > 0">
    <p>Дата</p>

    <div class="flex items-center gap-4 mt-1">
      <label
        v-for="availableDate in availableDates"
        :key="availableDate.toISOString()"
        class="flex flex-col cursor-pointer"
      >
        <input v-model="selectedDate" type="radio" :value="availableDate" class="peer sr-only">

        <div class="flex flex-col gap-1 p-2 peer-checked:bg-[#a79dfd] peer-checked:text-white rounded-lg">
          <span>{{ format(availableDate, 'd MMMM', { locale: ru }) }}</span>
          <span>{{ getRelativeDay(availableDate) }}</span>
        </div>
      </label>
    </div>
  </form>
</template>
