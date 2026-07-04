<script setup lang="ts" generic="T, K">
import { CALENDAR_CELL_TYPE, CALENDAR_DIRECTION, useCalendarCellRender } from ':modules/booking/widgets/booking-calendar/model'
import { computed, useTemplateRef } from 'vue'

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

const direction = computed(() => options.direction)

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
      :ref="cell.type === CALENDAR_CELL_TYPE.FIRST_ROW ? setItemCellRef : undefined"
      :style="cell.styles"
      :data-cell-type="cell.type"
    >
      <template v-if="cell.type === CALENDAR_CELL_TYPE.FIRST_ROW">
        <div>
          <slot name="item" />
        </div>
      </template>

      <template v-else-if="cell.type === CALENDAR_CELL_TYPE.FIRST_COLUMN">
        <span>col</span>
      </template>

      <template v-else-if="cell.type === CALENDAR_CELL_TYPE.LAST_COLUMN">
        <div v-if="direction === CALENDAR_DIRECTION.ROW">
          <slot name="item" />
        </div>
        <span v-else>col</span>
      </template>

      <template v-else>
        <span>cell</span>
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
