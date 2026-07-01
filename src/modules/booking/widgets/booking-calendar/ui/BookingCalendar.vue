<script setup lang="ts" generic="T, K">
import { useCalendarGridRender, useCalendarOverlayRender } from ':modules/booking/widgets/booking-calendar/model'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useTemplateRef } from 'vue'

interface Props {
  options: {
    timestampStart: Date
    timestampEnd: Date
    cellDuration: number
    subCellDuration: number
  }
  items: T[]
  events: K[]
}

const { options, items } = defineProps<Props>()

const containerRef = useTemplateRef('container')
const cellItemRef = useTemplateRef('cellWorkspace')

const {
  DEFAULT_CELL_WIDTH,
  DEFAULT_CELL_HEIGHT,
  timeSlots,
  cellsInFirstRow,
  cellsInFirstColumn,
  cellsInWorkspace,
  cellWorkspaceHeight,
  cellWorkspaceWidth,
  cellWorkspaceSubCellsCount,
  cellWorkspaceSubCellHeight,
  getFirstRowCellStyle,
  getFirstColumnCellStyle,
  getWorkspaceCellStyle,
  getWorkspaceCellCoords,
  getLastColumnCellStyle,
} = useCalendarGridRender(() => ({
  ...options,
  container: containerRef.value,
  cellWorkspace: cellItemRef.value?.at(0) ?? null,
  itemsCount: items.length,
}))

const {
  startAreaSelecting,
  changeAreaSelecting,
  stopAreaSelecting,
} = useCalendarOverlayRender(() => ({
  container: containerRef.value,
  subCellsCount: cellWorkspaceSubCellsCount.value,
  subCellsHeight: cellWorkspaceSubCellHeight.value,
  overlayClasses: ['bg-red-200/25'],
}))
</script>

<template>
  <article
    ref="container"
    class="relative select-none"
    @pointerdown="startAreaSelecting"
    @pointermove="changeAreaSelecting"
    @pointerup="stopAreaSelecting"
  >
    <time
      v-for="(item, idx) in items"
      :key="`cell-first-row-${idx}`"
      ref="cellWorkspace"
      :style="getFirstRowCellStyle(idx)"
      class="cell cell-first-row"
    >
      <slot name="item" :item="item" />
    </time>

    <time
      v-for="(_, idx) in cellsInFirstColumn"
      :key="`cell-first-column-${idx}`"
      :style="getFirstColumnCellStyle(idx)"
      class="cell cell-first-column"
    >
      {{ format(timeSlots[idx], 'HH:mm', { locale: ru }) }}
    </time>

    <time
      v-for="(_, idx) in cellsInWorkspace"
      :key="`cell-workspace-${idx}`"
      :style="getWorkspaceCellStyle(idx)"
      :data-column="getWorkspaceCellCoords(idx).column"
      :data-row="getWorkspaceCellCoords(idx).row"
      class="cell cell-workspace"
    >
      col {{ idx }}
    </time>

    <time
      v-for="(_, idx) in cellsInFirstColumn"
      :key="`cell-last-column-${idx}`"
      :style="getLastColumnCellStyle(idx)"
      class="cell cell-last-column"
    >
      {{ format(timeSlots[idx], 'HH:mm', { locale: ru }) }}
    </time>
  </article>
</template>

<style scoped>
article {
  flex-grow: 1;
  background: var(--color-system-generic);
  border-radius: var(--radius-xl);
  display: grid;
  grid-template-rows: minmax(max-content, 1fr) repeat(v-bind(cellsInFirstColumn), minmax(max-content, 1fr));
  grid-template-columns: max-content repeat(v-bind(cellsInFirstRow), minmax(max-content, 1fr));
  grid-auto-flow: column;
  overflow: auto;
}

.cell {
  --row: 0,
  --column: 0;

  grid-row: var(--row);
  grid-column: var(--column);
  min-width: calc(v-bind(DEFAULT_CELL_WIDTH) * 1px);
  min-height: calc(v-bind(DEFAULT_CELL_HEIGHT) * 1px);
}

.cell-first-column {
  width: calc(v-bind(DEFAULT_CELL_WIDTH) * 1px);
  height: calc(v-bind(cellWorkspaceHeight) * 1px);
}

.cell-workspace {
  width: calc(v-bind(cellWorkspaceWidth) * 1px);
  height: calc(v-bind(cellWorkspaceHeight) * 1px);
  border: 1px gray solid;
}

.cell-first-row,
.cell-first-column,
.cell-last-column {
  position: sticky;
  background: white;
  z-index: 10;
}

.cell-first-row.cell-first-column {
  z-index: 20;
}

.cell-first-row {
  top: 0;
}

.cell-first-column {
  left: 0;
  text-align: end;
  padding-inline: 1rem;
}

.cell-last-column {
  right: 0;
  text-align: start;
  padding-inline: 1rem;
}
</style>
