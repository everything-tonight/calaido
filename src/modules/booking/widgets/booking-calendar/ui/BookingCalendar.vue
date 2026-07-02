<script setup lang="ts" generic="T, K">
import { CALENDAR_CELL_TYPE, useCalendarCellRender } from ':modules/booking/widgets/booking-calendar/model'
import { useTemplateRef } from 'vue'

interface Props {
  options: {
    timestampStart: Date
    timestampEnd: Date
    cellDuration: number
    subCellDuration: number
    direction: 'row' | 'column'
    leftTimestampColumn: boolean
    rightTimestampColumn: boolean
  }
  items: T[]
  events: K[]
}

const { options, items, events: _events } = defineProps<Props>()

const containerRef = useTemplateRef('container')

const {
  cells,
  rows,
  columns,
} = useCalendarCellRender(() => ({
  ...options,
  container: containerRef.value,
  items: items.length,
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
      :style="cell.styles"
    >
      <template v-if="cell.type === CALENDAR_CELL_TYPE.FIRST_ROW || cell.type === CALENDAR_CELL_TYPE.LAST_ROW">
        <div>
          <slot name="item" />
        </div>
      </template>

      <template v-else-if="cell.type === CALENDAR_CELL_TYPE.FIRST_COLUMN || cell.type === CALENDAR_CELL_TYPE.LAST_COLUMN">
        <span>col</span>
      </template>

      <template v-else>
        <span>cell</span>
      </template>
    </time>
  </article>
</template>

<style scoped>
article {
  --rows: calc(v-bind(rows) * 1px);
  --columns: calc(v-bind(columns) * 1px);

  flex-grow: 1;
  background: var(--color-system-generic);
  border-radius: var(--radius-xl);
  display: grid;
  grid-template-rows: repeat(var(--rows), 1fr);
  grid-template-columns: repeat(var(--columns), minmax(72px, 1fr));
  grid-auto-flow: column;
  overflow: auto;
}

article time {
  --column: 0,
  --row: 0;

  grid-row: var(--row);
  grid-column: var(--column);
  border: 1px solid gray;
}
</style>
