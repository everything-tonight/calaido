import type { MaybeRefOrGetter } from 'vue'
import type { CalendarCell } from './booking-calendar.types'
import { computed, ref, toValue, watch } from 'vue'
import { getTimeSlots } from './booking-calendar.utils'

interface UseCalendarGridRenderOpts {
  timestampStart: Date
  timestampEnd: Date
  rangeBetweenStartAndEnd: number
  itemsCount: number
}

export function useCalendarGridRender(opts: MaybeRefOrGetter<UseCalendarGridRenderOpts>) {
  const DEFAULT_CELL_WIDTH = 72
  const DEFAULT_CELL_HEIGHT = 56

  const RESERVED_COLUMN = 1
  const RESERVED_TIME_CELL = 1

  const state = ref(toValue(opts))

  const timeCells = computed(() => {
    return getTimeSlots(state.value.timestampStart, state.value.timestampEnd, state.value.rangeBetweenStartAndEnd)
  })

  const rowsCount = computed(() => timeCells.value.length)
  const columnsCount = computed(() => state.value.itemsCount)

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
        timestamp: row > 0 ? timeCells.value[row - 1] : state.value.timestampStart,
        column: column + 1,
        row: row + 1,
      }
    }

    return result
  })

  watch(() => toValue(opts), (newOpts) => {
    state.value = newOpts
  }, { deep: true })

  return {
    DEFAULT_CELL_HEIGHT,
    DEFAULT_CELL_WIDTH,
    cells,
    rowsCount,
    columnsCount,
  }
}
