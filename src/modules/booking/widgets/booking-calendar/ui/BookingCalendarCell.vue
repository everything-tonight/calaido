<script setup lang="ts" generic="T">
import type { CalendarCell } from '../model/booking-calendar.types'
import { cn } from ':modules/core/shared/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { computed, useSlots } from 'vue'

const { timestamp, column, row } = defineProps<CalendarCell>()
const slots = useSlots()

const isFirstColumn = computed(() => column === 1)
const isFirstRow = computed(() => row === 1)
</script>

<template>
  <time
    :datetime="timestamp.toString()"
    :class="cn(
      'bg-system-generic text-center border border-system-outline w-24 h-16',
      {
        'sticky top-0 z-10': isFirstRow,
        'sticky left-0 z-10': isFirstColumn,
        'z-20': isFirstColumn && isFirstRow,
      })"
    :data-column="column"
    :data-row="row"
    :data-timestamp="timestamp"
  >
    <slot v-if="isFirstRow && slots.item" name="item" />
    <span v-else>{{ format(timestamp, 'HH:mm', { locale: ru }) }}</span>
  </time>
</template>
