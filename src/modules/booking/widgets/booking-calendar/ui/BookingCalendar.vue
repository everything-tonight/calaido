<script setup lang="ts" generic="T">
import type { CalendarCell } from '../model/booking-calendar.types.js'

import { addMinutes, differenceInMinutes } from 'date-fns'
import { computed } from 'vue'
import BookingCalendarCell from './BookingCalendarCell.vue'

interface Props {
  timestampStart: Date
  timestampEnd: Date
  timestampRange: number
  items: T[]
}

const {
  timestampStart,
  timestampEnd,
  timestampRange,
  items,
} = defineProps<Props>()

const DEFAULT_CELL_WIDTH = 72
const DEFAULT_CELL_HEIGHT = 56

const RESERVED_COLUMN = 1
const RESERVED_TIME_CELL = 1

function getTimeSlots(timestampStart: Date, timestampEnd: Date, timestampRange: number) {
  const cells = []

  let minutes = differenceInMinutes(timestampEnd, timestampStart)

  cells.push(timestampStart)

  while (minutes / timestampRange >= 1) {
    const currentTimestamp = addMinutes(timestampStart, timestampRange)

    cells.push(currentTimestamp)

    timestampStart = currentTimestamp
    minutes -= timestampRange
  }

  if (minutes) {
    cells.push(addMinutes(timestampStart, minutes))
  }

  return cells
}

const timeCells = computed(() => {
  return getTimeSlots(timestampStart, timestampEnd, timestampRange)
})

const columnsCount = computed(() => items.length)
const rowsCount = computed(() => timeCells.value.length)

const cells = computed<CalendarCell[]>(() => {
  const columnsWithReserved = RESERVED_COLUMN + columnsCount.value
  const timeCellsWithReserved = RESERVED_TIME_CELL + rowsCount.value

  const totalCellsCount = columnsWithReserved * timeCellsWithReserved

  const result: CalendarCell[] = []

  for (let index = 0; index < totalCellsCount; index++) {
    const column = Math.floor(index / timeCellsWithReserved)
    const row = index % timeCellsWithReserved

    result[index] = {
      id: index,
      timestamp: row > 0 ? timeCells.value[row - 1] : timestampStart,
      column: column + 1,
      row: row + 1,
    }
  }

  return result
})
</script>

<template>
  <article>
    <BookingCalendarCell
      v-for="cell in cells"
      :key="cell.id"
      v-bind="cell"
    >
      <template #item>
        <slot name="item" />
      </template>
    </BookingCalendarCell>
  </article>
</template>

<style scoped>
article {
  --rowsCount: v-bind(rowsCount);
  --columnsCount: v-bind(columnsCount);
  --cell-width: calc(v-bind(DEFAULT_CELL_WIDTH) * 1px);
  --cell-height: calc(v-bind(DEFAULT_CELL_HEIGHT) * 1px);

  flex-grow: 1;
  background: var(--color-system-generic);
  border-radius: var(--radius-xl);
  display: grid;
  grid-template-rows: var(--cell-height) repeat(var(--rowsCount), minmax(var(--cell-height), 1fr));
  grid-template-columns: var(--cell-width) repeat(var(--columnsCount), minmax(var(--cell-width), 1fr));
  grid-auto-flow: column;
  overflow: scroll;
}
</style>
