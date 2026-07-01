import type { MaybeRefOrGetter } from 'vue'
import { watchDeep } from '@vueuse/core'
import { computed, ref, toValue } from 'vue'
import { getTimeSlots } from '../booking-calendar.utils'

interface UseCalendarGridRenderOptions {
  container: HTMLElement | null
  cellWorkspace: HTMLTimeElement | null
  timestampStart: Date
  timestampEnd: Date
  cellDuration: number
  subCellDuration: number
  itemsCount: number
}

export function useCalendarGridRender(opts: MaybeRefOrGetter<UseCalendarGridRenderOptions>) {
  const DEFAULT_CELL_WIDTH = 72
  const DEFAULT_CELL_HEIGHT = 56

  const state = ref(toValue(opts))

  const columnsCount = computed(() => state.value.itemsCount)

  const timeSlots = computed(() => {
    return getTimeSlots(state.value.timestampStart, state.value.timestampEnd, state.value.cellDuration)
  })

  const cellsInFirstColumn = computed(() => timeSlots.value.length)
  const cellsInFirstRow = computed(() => state.value.itemsCount)

  const cellsInWorkspace = computed(() => cellsInFirstColumn.value * columnsCount.value)

  const cellWorkspaceWidth = computed(() => {
    if (state.value.cellWorkspace) {
      return state.value.cellWorkspace.offsetWidth
    }

    return 0
  })

  const cellWorkspaceHeight = computed(() => {
    if (state.value.cellWorkspace) {
      return state.value.cellWorkspace.offsetHeight
    }

    return 0
  })

  const cellWorkspaceSubCellsCount = computed(() => {
    return Math.max(1, Math.floor(state.value.cellDuration / state.value.subCellDuration))
  })

  const cellWorkspaceSubCellHeight = computed(() => {
    return cellWorkspaceHeight.value / cellWorkspaceSubCellsCount.value
  })

  function getFirstRowCellStyle(index: number): string {
    return `--column: ${2 + index}; --row: 1;`
  }

  function getFirstColumnCellStyle(index: number): string {
    return `--column: 1; --row: ${2 + index};`
  }

  function getLastColumnCellStyle(index: number): string {
    return `--column: ${cellsInWorkspace.value + 1}; --row: ${2 + index};`
  }

  function getWorkspaceCellCoords(index: number) {
    return {
      column: 2 + Math.floor(index / cellsInFirstColumn.value),
      row: 2 + (index % cellsInFirstColumn.value),
    }
  }

  function getWorkspaceCellStyle(index: number): string {
    const { column, row } = getWorkspaceCellCoords(index)

    return `--column: ${column}; --row: ${row};`
  }

  watchDeep(() => toValue(opts), (newOpts) => {
    state.value = newOpts
  })

  return {
    DEFAULT_CELL_HEIGHT,
    DEFAULT_CELL_WIDTH,
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
  }
}
