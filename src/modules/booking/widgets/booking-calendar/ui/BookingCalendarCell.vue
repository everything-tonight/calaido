<script setup lang="ts" generic="T">
import type { CalendarCell } from '../model/booking-calendar.types'
import { cn } from ':modules/core/shared/utils'

const props = defineProps<CalendarCell>()
</script>

<template>
  <time
    :class="cn(
      'bg-system-generic text-center border border-system-outline',
    )"
    :data-column="props.column"
    :data-row="props.row"
  >
    <slot />
  </time>
</template>

<style scoped>
time {
  grid-column: v-bind(column);
  grid-row: v-bind(row);
  width: v-bind(width);
  height: v-bind(height)
}
</style>
