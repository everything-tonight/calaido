<script setup lang="ts" generic="T, K">
import type { CalendarCellType } from ':modules/booking/widgets/booking-calendar/model'
import { CALENDAR_CELL_TYPE, useCalendarCellRender } from ':modules/booking/widgets/booking-calendar/model'
import { useTemplateRef } from 'vue'

interface Props {
  options: {
    timestampStart: Date
    timestampEnd: Date
    cellDuration: number
    subCellDuration: number
    excludeAreas?: Omit<CalendarCellType, 'workspace'>[]
  }
  items: T[]
  events: K[]
}

const { options, items, events: _events } = defineProps<Props>()

const containerRef = useTemplateRef('container')
const cellsRefs = useTemplateRef('cell')

const {
  cells,
  rows,
  columns,
} = useCalendarCellRender(() => ({
  ...options,
  container: containerRef.value,
  cells: cellsRefs.value,
  itemsCount: items.length,
  hasFirstColumn: !options.excludeAreas?.includes('firstColumn'),
  hasLastColumn: !options.excludeAreas?.includes('lastColumn'),
  hasFirstRow: !options.excludeAreas?.includes('firstRow'),
  hasLastRow: !options.excludeAreas?.includes('lastRow'),
}))
</script>

<template>
  <article
    ref="container"
    class="relative select-none"
  >
    <time
      v-for="(cell, index) in cells"
      :key="index"
      ref="cell"
      :style="cell.styles"
      :data-type="cell.type"
    >
      <template v-if="cell.type === CALENDAR_CELL_TYPE.FIRST_ROW">
        <slot name="firstRow" v-bind="cell" />
      </template>

      <template v-if="cell.type === CALENDAR_CELL_TYPE.LAST_ROW">
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
  --rows: v-bind(rows);
  --columns: v-bind(columns);

  flex-grow: 1;
  background: var(--color-system-generic);
  border-radius: var(--radius-xl);
  display: grid;
  grid-template-rows: repeat(var(--rows), max-content);
  grid-template-columns: repeat(var(--columns), minmax(max-content, 1fr));
  grid-auto-flow: column;
  overflow: auto;
}

article time {
  --column: 0;
  --row: 0;

  grid-row: var(--row);
  grid-column: var(--column);
  min-width: 72px;
  min-height: 48px;
  border: 1px solid gray;
}
</style>
