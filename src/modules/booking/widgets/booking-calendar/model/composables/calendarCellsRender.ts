import type { MaybeRefOrGetter } from 'vue'
import type { CalendarCell } from '../booking-calendar.types'
import { watchDeep } from '@vueuse/core'
import { computed, ref, toValue } from 'vue'
import { CALENDAR_CELL_TYPE } from '../booking-calendar.types'
import { getFirstColumnCellCoords, getFirstRowCellCoords, getLastColumnCellCoords, getTimeSlots, getWorkspaceCellPosition, isRowDirection } from '../booking-calendar.utils'

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

  const workspaceStartColumn = computed(() => {
    return state.value.leftTimestampColumn ? 2 : 1
  })

  const cellsInColumn = computed(() => timeSlots.value.length)

  const cellsInRow = computed(() => state.value.items)

  const cellsInWorkspaceArea = computed(() => cellsInColumn.value * cellsInRow.value)

  const firstColumnCells = computed(() => {
    if (!state.value.leftTimestampColumn)
      return []

    const cells: CalendarCell[] = []

    for (let index = 0; index < cellsInColumn.value; index++) {
      const { column, row } = getFirstColumnCellCoords(index, {
        direction: state.value.direction,
        workspaceStartColumn: workspaceStartColumn.value,
      })

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

  const firstRowCells = computed(() => {
    const cells: CalendarCell[] = []

    for (let index = 0; index < cellsInRow.value; index++) {
      const { column, row } = getFirstRowCellCoords(index, {
        direction: state.value.direction,
        workspaceStartColumn: workspaceStartColumn.value,
      })

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

  const lastColumnCells = computed(() => {
    if (!state.value.rightTimestampColumn)
      return []

    const cellsCount = isRowDirection(state.value.direction) ? cellsInRow.value : cellsInColumn.value
    const cells: CalendarCell[] = []

    for (let index = 0; index < cellsCount; index++) {
      const { column, row } = getLastColumnCellCoords(index, {
        direction: state.value.direction,
        workspaceStartColumn: workspaceStartColumn.value,
        columnCells: cellsInColumn.value,
        rowCells: cellsInRow.value,
      })

      cells.push({
        column,
        row,
        width: 0,
        height: 0,
        subCell: 0,
        subCellHeight: 0,
        subCellWidth: 0,
        styles: `--column: ${column}; --row: ${row}`,
        type: isRowDirection(state.value.direction) ? CALENDAR_CELL_TYPE.LAST_ROW : CALENDAR_CELL_TYPE.LAST_COLUMN,
      })
    }

    return cells
  })

  const workspaceAreaCells = computed(() => {
    const cells: CalendarCell[] = []

    for (let index = 0; index < cellsInWorkspaceArea.value; index++) {
      const { column, row } = getWorkspaceCellPosition(index, {
        direction: state.value.direction,
        workspaceStartColumn: workspaceStartColumn.value,
        columnCells: cellsInColumn.value,
      })

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
    return isRowDirection(state.value.direction) ? cellsInRow.value : cellsInColumn.value
  })

  const columns = computed(() => {
    return (isRowDirection(state.value.direction) ? cellsInColumn.value : cellsInRow.value) + (state.value.rightTimestampColumn ? 1 : 0)
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
