import type { MaybeRefOrGetter } from 'vue'
import type { CalendarCell } from '../booking-calendar.types'
import { watchDeep } from '@vueuse/core'
import { computed, ref, toValue } from 'vue'
import { getTimeSlots } from '../booking-calendar.utils'

interface UseCalendarGridRenderOptions {
  timestampStart: Date
  timestampEnd: Date
  cellDuration: number
  subCellDuration: number
  itemsCount: number
}

export function useCalendarGridRender(opts: MaybeRefOrGetter<UseCalendarGridRenderOptions>) {
  const DEFAULT_CELL_WIDTH = 72
  const DEFAULT_CELL_HEIGHT = 56

  const RESERVED_COLUMN = 1
  const RESERVED_TIME_CELL = 1

  const state = ref(toValue(opts))

  const timeCells = computed(() => {
    return getTimeSlots(state.value.timestampStart, state.value.timestampEnd, state.value.cellDuration)
  })

  const rowsCount = computed(() => timeCells.value.length)
  const columnsCount = computed(() => state.value.itemsCount)
  const subCellsCount = computed(() => state.value.cellDuration / state.value.subCellDuration)
  const subCellHeight = computed(() => DEFAULT_CELL_HEIGHT / subCellsCount.value)

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
        subCellCount: subCellsCount.value,
        subCellHeight: subCellHeight.value,
      }
    }

    return result
  })

  watchDeep(() => toValue(opts), (newOpts) => {
    state.value = newOpts
  })

  return {
    DEFAULT_CELL_HEIGHT,
    DEFAULT_CELL_WIDTH,
    cells,
    rowsCount,
    columnsCount,
    subCellsCount,
    subCellHeight,
  }
}
