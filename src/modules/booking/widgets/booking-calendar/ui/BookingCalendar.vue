<script setup lang="ts" generic="T, K">
import type { CalendarCellType } from ':modules/booking/widgets/booking-calendar/model'
import { CALENDAR_CELL_TYPE, getTimeSlots } from ':modules/booking/widgets/booking-calendar/model'
import { computed, toRefs, useTemplateRef } from 'vue'
import { useCalendarCellPositions } from '../model/composables/calendarCellPositions'
import { useCalendarCellStyles } from '../model/composables/calendarCellStyles'

interface Props {
  timestampStart: Date
  timestampEnd: Date
  cellDuration: number
  subCellDuration: number
  excludeAreas?: Record<CalendarCellType, boolean>
  items: T[]
  events: K[]
}

const props = withDefaults(defineProps<Props>(), {
  excludeAreas: () => ({
    firstColumn: false,
    lastColumn: false,
    firstRow: false,
    lastRow: false,
    workspace: false,
  }),
})

const {
  timestampStart,
  timestampEnd,
  cellDuration,
  subCellDuration,
  items,
  excludeAreas,
} = toRefs(props)

const containerRef = useTemplateRef('container')

const timeSlots = computed(() => {
  return getTimeSlots(timestampStart.value, timestampEnd.value, cellDuration.value)
})

const { cells: unstyledCells, columns, rows } = useCalendarCellPositions(() => ({
  timeSlots: timeSlots.value,
  cellDuration: cellDuration.value,
  subCellDuration: subCellDuration.value,
  itemsCount: items.value.length,
  hasFirstColumn: !excludeAreas.value.firstColumn,
  hasLastColumn: !excludeAreas.value.lastColumn,
  hasFirstRow: !excludeAreas.value.firstRow,
  hasLastRow: !excludeAreas.value.lastRow,
}))

const { cells } = useCalendarCellStyles(containerRef, unstyledCells)
</script>

<template>
  <article
    ref="container"
    class="relative select-none"
  >
    <time
      v-for="(cell, index) in cells"
      :key="index"
      :data-cell-type="cell.type"
      :datetime="cell.timestamp.toString()"
      :style="cell.style"
    >
      <template v-if="cell.type === CALENDAR_CELL_TYPE.FIRST_ROW">
        <slot name="firstRow" v-bind="cell" />
      </template>

      <template v-else-if="cell.type === CALENDAR_CELL_TYPE.LAST_ROW">
        <slot name="lastRow" v-bind="cell" />
      </template>

      <template v-else-if="cell.type === CALENDAR_CELL_TYPE.FIRST_COLUMN">
        <slot name="firstColumn" v-bind="cell" />
      </template>

      <template v-else-if="cell.type === CALENDAR_CELL_TYPE.LAST_COLUMN">
        <slot name="lastColumn" v-bind="cell" />
      </template>

      <template v-else-if="cell.type === CALENDAR_CELL_TYPE.WORKSPACE">
        <slot name="workspace" v-bind="cell" />
      </template>
    </time>
  </article>
</template>

<style scoped>
article {
  flex: 1 1 0%;
  min-height: 0;
  min-width: 0;
  background: var(--color-system-generic);
  border-radius: var(--radius-xl);
  display: grid;
  grid-template-rows: repeat(v-bind(rows), minmax(max-content, 1fr));
  grid-template-columns: repeat(v-bind(columns), minmax(max-content, 1fr));
  overflow: auto;
}

article time {
  border: 1px solid gray;
  min-width: 72px;
  min-height: 56px;
}
</style>
