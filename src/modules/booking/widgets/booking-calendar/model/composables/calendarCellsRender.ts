import type { MaybeRefOrGetter } from 'vue'
import type { CalendarCell } from '../booking-calendar.types'
import { watchDeep } from '@vueuse/core'
import { computed, ref, toValue } from 'vue'
import { CALENDAR_CELL_TYPE } from '../booking-calendar.types'
import { getTimeSlots, HEADER_COLUMN_INDEX, HEADER_ROW_INDEX, isRowDirection, WORKSPACE_START_COLUMN_INDEX, WORKSPACE_START_ROW_INDEX } from '../booking-calendar.utils'

interface UseCalendarCellsRenderOptions {
  container: HTMLElement | null
  timestampStart: Date
  timestampEnd: Date
  cellDuration: number
  subCellDuration: number
  items: number
  direction: 'row' | 'column'
  leftTimestampColumn: boolean
  rightTimestampColumn: boolean
}

export function useCalendarCellRender(opts: MaybeRefOrGetter<UseCalendarCellsRenderOptions>) {
  const state = ref(toValue(opts))

  const timeSlots = computed(() => {
    return getTimeSlots(state.value.timestampStart, state.value.timestampEnd, state.value.cellDuration)
  })

  const workspaceStartColumn = computed(() => WORKSPACE_START_COLUMN_INDEX)

  const workspaceStartRow = computed(() => WORKSPACE_START_ROW_INDEX)

  const cellsInColumn = computed(() => Math.max(0, timeSlots.value.length - 1))

  const cellsInRow = computed(() => state.value.items)

  const cellsInWorkspaceArea = computed(() => cellsInColumn.value * cellsInRow.value)

  const firstColumnCells = computed(() => {
    if (!state.value.leftTimestampColumn)
      return []

    const cells: CalendarCell[] = []

    for (let index = 0; index < cellsInColumn.value; index++) {
      const { column, row } = isRowDirection(state.value.direction)
        ? { column: workspaceStartColumn.value + index, row: HEADER_ROW_INDEX }
        : { column: HEADER_COLUMN_INDEX, row: workspaceStartRow.value + index }

      cells.push({
        column,
        row,
        width: 0,
        height: 0,
        subCell: 0,
        subCellHeight: 0,
        subCellWidth: 0,
        styles: `--column: ${column}; --row: ${row}`,
        type: CALENDAR_CELL_TYPE.FIRST_COLUMN,
      })
    }

    return cells
  })

  const lastColumnCells = computed(() => {
    if (!state.value.rightTimestampColumn)
      return []

    const isRow = isRowDirection(state.value.direction)
    const cellsCount = isRow ? cellsInRow.value : cellsInColumn.value
    const cells: CalendarCell[] = []

    for (let index = 0; index < cellsCount; index++) {
      const { column, row } = isRow
        ? { column: workspaceStartColumn.value + cellsInColumn.value, row: workspaceStartRow.value + index }
        : { column: workspaceStartColumn.value + cellsInRow.value, row: workspaceStartRow.value + index }

      cells.push({
        column,
        row,
        width: 0,
        height: 0,
        subCell: 0,
        subCellHeight: 0,
        subCellWidth: 0,
        styles: `--column: ${column}; --row: ${row}`,
        type: CALENDAR_CELL_TYPE.LAST_COLUMN,
      })
    }

    return cells
  })

  const firstRowCells = computed(() => {
    const cells: CalendarCell[] = []

    for (let index = 0; index < cellsInRow.value; index++) {
      const { column, row } = isRowDirection(state.value.direction)
        ? { column: HEADER_COLUMN_INDEX, row: workspaceStartRow.value + index }
        : { column: workspaceStartColumn.value + index, row: HEADER_ROW_INDEX }

      cells.push({
        column,
        row,
        width: 0,
        height: 0,
        subCell: 0,
        subCellHeight: 0,
        subCellWidth: 0,
        styles: `--column: ${column}; --row: ${row}`,
        type: CALENDAR_CELL_TYPE.FIRST_ROW,
      })
    }

    return cells
  })

  const workspaceAreaCells = computed(() => {
    const cells: CalendarCell[] = []

    for (let index = 0; index < cellsInWorkspaceArea.value; index++) {
      const rowInGroup = index % cellsInColumn.value
      const groupIndex = Math.floor(index / cellsInColumn.value)

      const { column, row } = isRowDirection(state.value.direction)
        ? { column: workspaceStartColumn.value + rowInGroup, row: workspaceStartRow.value + groupIndex }
        : { column: workspaceStartColumn.value + groupIndex, row: workspaceStartRow.value + rowInGroup }

      cells.push({
        column,
        row,
        width: 0,
        height: 0,
        subCell: 0,
        subCellHeight: 0,
        subCellWidth: 0,
        styles: `--column: ${column}; --row: ${row}`,
        type: CALENDAR_CELL_TYPE.WORKSPACE,
      })
    }

    return cells
  })

  const cells = computed(() => {
    return [...firstColumnCells.value, ...firstRowCells.value, ...workspaceAreaCells.value, ...lastColumnCells.value]
  })

  const rows = computed(() => {
    return isRowDirection(state.value.direction)
      ? cellsInRow.value + 1
      : cellsInColumn.value + 1
  })

  const columns = computed(() => {
    return isRowDirection(state.value.direction)
      ? cellsInColumn.value + 1 + (state.value.rightTimestampColumn ? 1 : 0)
      : cellsInRow.value + 1 + (state.value.rightTimestampColumn ? 1 : 0)
  })

  watchDeep(() => toValue(opts), (newOpts) => {
    state.value = newOpts
  })

  return {
    cells,
    rows,
    columns,
  }
}
