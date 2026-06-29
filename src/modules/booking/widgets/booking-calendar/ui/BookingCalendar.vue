<script setup lang="ts" generic="T">
import { useCalendarGridRender } from ':modules/booking/widgets/booking-calendar/model'

import { useTemplateRef } from 'vue'
import { useCalendarActionsRender } from '../model/composables/calendarActionsRender.ts'
import BookingCalendarCell from './BookingCalendarCell.vue'

interface Props {
  options: {
    timestampStart: Date
    timestampEnd: Date
    cellDuration: number
    subCellDuration: number
  }
  items: T[]
}

const { options, items } = defineProps<Props>()

const calendarRef = useTemplateRef('calendar')

const {
  cells,
  rowsCount,
  columnsCount,
  subCellsCount,
} = useCalendarGridRender(() => ({
  ...options,
  itemsCount: items.length,
}))

const {
  startAreaSelecting,
  changeAreaSelecting,
  stopAreaSelecting,
} = useCalendarActionsRender(() => ({
  container: calendarRef.value,
  overlayClasses: ['bg-brand/50 rounded'],
  subCellsCount: subCellsCount.value,
}))
</script>

<template>
  <article
    ref="calendar"
    class="relative select-none"
    @pointerdown="startAreaSelecting"
    @pointermove="changeAreaSelecting"
    @pointerup="stopAreaSelecting"
  >
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

  flex-grow: 1;
  background: var(--color-system-generic);
  border-radius: var(--radius-xl);
  display: grid;
  grid-template-rows: min-content repeat(var(--rowsCount), minmax(min-content, 1fr));
  grid-template-columns: min-content repeat(var(--columnsCount), minmax(min-content, 1fr));
  grid-auto-flow: column;
  overflow: scroll;
}
</style>
