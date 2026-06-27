<script setup lang="ts" generic="T">
import { useCalendarGridRender } from ':modules/booking/widgets/booking-calendar/model'

import BookingCalendarCell from './BookingCalendarCell.vue'

interface Props {
  timestampStart: Date
  timestampEnd: Date
  timestampRange: number
  items: T[]
}

const props = defineProps<Props>()

const {
  cells,
  rowsCount,
  columnsCount,
} = useCalendarGridRender(() => ({
  timestampStart: props.timestampStart,
  timestampEnd: props.timestampEnd,
  rangeBetweenStartAndEnd: props.timestampRange,
  itemsCount: props.items.length,
}))
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
