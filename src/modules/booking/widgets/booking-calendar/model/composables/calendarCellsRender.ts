import type { MaybeRefOrGetter } from 'vue'
import type { CalendarCell } from '../booking-calendar.types'
import { watchDeep } from '@vueuse/core'
import { computed, ref, toValue } from 'vue'
import { CALENDAR_CELL_TYPE } from '../booking-calendar.types'
import { getTimeSlots } from '../booking-calendar.utils'

interface UseCalendarCellsRenderOptions {
  container: HTMLElement | null
  timestampStart: Date
  timestampEnd: Date
  cellDuration: number
  subCellDuration: number
  itemsCount: number
  hasFirstColumn?: boolean
  hasLastColumn?: boolean
  hasFirstRow?: boolean
  hasLastRow?: boolean
}

export function useCalendarCellRender(opts: MaybeRefOrGetter<UseCalendarCellsRenderOptions>) {
  const FIRST_ROW_START_ROW = 1
  const FIRST_COLUMN_START_COLUMN = 1

  const state = ref(toValue(opts))

  const hasFirstColumn = computed(() => state.value.hasFirstColumn ?? true)
  const hasLastColumn = computed(() => state.value.hasLastColumn ?? true)
  const hasFirstRow = computed(() => state.value.hasFirstRow ?? true)
  const hasLastRow = computed(() => state.value.hasLastRow ?? true)

  const workspaceCellStartColumn = computed(() => hasFirstColumn.value ? 2 : 1)
  const workspaceCellStartRow = computed(() => hasFirstRow.value ? 2 : 1)

  const timeSlots = computed(() => {
    return getTimeSlots(state.value.timestampStart, state.value.timestampEnd, state.value.cellDuration)
  })

  const cellsInColumn = computed(() => timeSlots.value.length)

  const cellsInRow = computed(() => state.value.itemsCount)

  const cellsInWorkspaceArea = computed(() => cellsInColumn.value * cellsInRow.value)

  const rows = computed(() => {
    return cellsInColumn.value + (hasFirstRow.value ? 1 : 0) + (hasLastRow.value ? 1 : 0)
  })

  const columns = computed(() => {
    return cellsInRow.value + (hasFirstColumn.value ? 1 : 0) + (hasLastColumn.value ? 1 : 0)
  })

  const firstColumnCells = computed(() => {
    const cells: CalendarCell[] = []

    if (!hasFirstColumn.value)
      return cells

    for (let index = 0; index < cellsInColumn.value; index++) {
      const column = FIRST_COLUMN_START_COLUMN
      const row = workspaceCellStartRow.value + index

      cells.push({
        column,
        row,
        width: 0,
        height: 0,
        subCell: 0,
        subCellHeight: 0,
        subCellWidth: 0,
        timestamp: timeSlots.value[0],
        styles: `--column: ${column}; --row: ${row}`,
        type: CALENDAR_CELL_TYPE.FIRST_COLUMN,
      })
    }

    return cells
  })

  const lastColumnCells = computed(() => {
    const cells: CalendarCell[] = []

    if (!hasLastColumn.value)
      return cells

    for (let index = 0; index < cellsInColumn.value; index++) {
      const column = columns.value
      const row = workspaceCellStartRow.value + index

      cells.push({
        column,
        row,
        width: 0,
        height: 0,
        subCell: 0,
        subCellHeight: 0,
        subCellWidth: 0,
        timestamp: timeSlots.value[0],
        styles: `--column: ${column}; --row: ${row}`,
        type: CALENDAR_CELL_TYPE.LAST_COLUMN,
      })
    }

    return cells
  })

  const firstRowCells = computed(() => {
    const cells: CalendarCell[] = []

    if (!hasFirstRow.value)
      return cells

    for (let index = 0; index < cellsInRow.value; index++) {
      const column = workspaceCellStartColumn.value + index
      const row = FIRST_ROW_START_ROW

      cells.push({
        column,
        row,
        width: 0,
        height: 0,
        subCell: 0,
        subCellHeight: 0,
        subCellWidth: 0,
        timestamp: timeSlots.value[0],
        styles: `--column: ${column}; --row: ${row}`,
        type: CALENDAR_CELL_TYPE.FIRST_ROW,
      })
    }

    return cells
  })

  const lastRowCells = computed(() => {
    const cells: CalendarCell[] = []

    if (!hasLastRow.value)
      return cells

    for (let index = 0; index < cellsInRow.value; index++) {
      const column = workspaceCellStartColumn.value + index
      const row = rows.value

      cells.push({
        column,
        row,
        width: 0,
        height: 0,
        subCell: 0,
        subCellHeight: 0,
        subCellWidth: 0,
        timestamp: timeSlots.value[0],
        styles: `--column: ${column}; --row: ${row}`,
        type: CALENDAR_CELL_TYPE.LAST_ROW,
      })
    }

    return cells
  })

  const workspaceAreaCells = computed(() => {
    const cells: CalendarCell[] = []

    for (let index = 0; index < cellsInWorkspaceArea.value; index++) {
      const rowInGroup = index % cellsInColumn.value
      const groupIndex = Math.floor(index / cellsInColumn.value)

      const column = workspaceCellStartColumn.value + groupIndex
      const row = workspaceCellStartRow.value + rowInGroup

      cells.push({
        column,
        row,
        width: 0,
        height: 0,
        subCell: 0,
        subCellHeight: 0,
        subCellWidth: 0,
        timestamp: timeSlots.value[rowInGroup],
        styles: `--column: ${column}; --row: ${row}`,
        type: CALENDAR_CELL_TYPE.WORKSPACE,
      })
    }

    return cells
  })

  const cells = computed(() => {
    return [
      ...firstColumnCells.value,
      ...firstRowCells.value,
      ...workspaceAreaCells.value,
      ...lastColumnCells.value,
      ...lastRowCells.value,
    ]
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
