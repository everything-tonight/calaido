import type { MaybeRefOrGetter } from 'vue'
import type { CalendarCellPosition } from '../booking-calendar.types'
import { computed, ref, toValue, watch } from 'vue'
import { CALENDAR_CELL_TYPE } from '../booking-calendar.types'

interface UseCalendarCellPositionsOptions {
  timeSlots: Date[]
  itemsCount: number
  cellDuration: number
  subCellDuration: number
  hasFirstColumn: boolean
  hasLastColumn: boolean
  hasFirstRow: boolean
  hasLastRow: boolean
}

export function useCalendarCellPositions(opts: MaybeRefOrGetter<UseCalendarCellPositionsOptions>) {
  const FIRST_ROW = 1
  const SECOND_ROW = 2

  const FIRST_COLUMN = 1
  const SECOND_COLUMN = 2

  const state = ref<UseCalendarCellPositionsOptions>(toValue(opts))

  const workspaceCellStartColumn = computed(() => state.value.hasFirstColumn ? SECOND_COLUMN : FIRST_COLUMN)
  const workspaceCellStartRow = computed(() => state.value.hasFirstRow ? SECOND_ROW : FIRST_ROW)

  const cellsInColumn = computed<number>(() => state.value.timeSlots.length)
  const cellsInRow = computed<number>(() => state.value.itemsCount)
  const cellsInWorkspaceArea = computed<number>(() => cellsInColumn.value * cellsInRow.value)

  const subCells = computed<number>(() => {
    return state.value.cellDuration / state.value.subCellDuration
  })

  const rows = computed<number>(() => {
    return cellsInColumn.value + Number(state.value.hasFirstRow) + Number(state.value.hasLastRow)
  })

  const columns = computed<number>(() => {
    return cellsInRow.value + Number(state.value.hasFirstColumn) + Number(state.value.hasLastColumn)
  })

  const firstColumnCells = computed<CalendarCellPosition[]>(() => {
    const cells: CalendarCellPosition[] = []

    if (!state.value.hasFirstColumn)
      return cells

    const type = CALENDAR_CELL_TYPE.FIRST_COLUMN

    for (let index = 0; index < cellsInColumn.value; index++) {
      const column = FIRST_COLUMN
      const row = workspaceCellStartRow.value + index

      cells.push({
        type,
        timestamp: state.value.timeSlots[index],
        column,
        row,
        subCells: subCells.value,
      })
    }

    return cells
  })

  const lastColumnCells = computed<CalendarCellPosition[]>(() => {
    const cells: CalendarCellPosition[] = []

    if (!state.value.hasLastColumn)
      return cells

    const type = CALENDAR_CELL_TYPE.LAST_COLUMN

    for (let index = 0; index < cellsInColumn.value; index++) {
      const column = columns.value
      const row = workspaceCellStartRow.value + index

      cells.push({
        type,
        column,
        row,
        timestamp: state.value.timeSlots[index],
        subCells: subCells.value,
      })
    }

    return cells
  })

  const firstRowCells = computed<CalendarCellPosition[]>(() => {
    const cells: CalendarCellPosition[] = []

    if (!state.value.hasFirstRow)
      return cells

    const type = CALENDAR_CELL_TYPE.FIRST_ROW

    for (let index = 0; index < cellsInRow.value; index++) {
      const column = workspaceCellStartColumn.value + index
      const row = FIRST_ROW

      cells.push({
        type,
        column,
        row,
        timestamp: state.value.timeSlots[0],
        subCells: subCells.value,
      })
    }

    return cells
  })

  const lastRowCells = computed<CalendarCellPosition[]>(() => {
    const cells: CalendarCellPosition[] = []

    if (!state.value.hasLastRow)
      return cells

    const type = CALENDAR_CELL_TYPE.LAST_ROW

    for (let index = 0; index < cellsInRow.value; index++) {
      const column = workspaceCellStartColumn.value + index
      const row = rows.value

      cells.push({
        type,
        column,
        row,
        timestamp: state.value.timeSlots[state.value.timeSlots.length - 1],
        subCells: subCells.value,
      })
    }

    return cells
  })

  const workspaceCells = computed<CalendarCellPosition[]>(() => {
    const cells: CalendarCellPosition[] = []

    const type = CALENDAR_CELL_TYPE.WORKSPACE

    for (let index = 0; index < cellsInWorkspaceArea.value; index++) {
      const rowInGroup = index % cellsInColumn.value
      const groupIndex = Math.floor(index / cellsInColumn.value)

      const column = workspaceCellStartColumn.value + groupIndex
      const row = workspaceCellStartRow.value + rowInGroup

      cells.push({
        type,
        column,
        row,
        timestamp: state.value.timeSlots[rowInGroup],
        subCells: subCells.value,
      })
    }

    return cells
  })

  const cells = computed<CalendarCellPosition[]>(() => {
    return [
      ...firstColumnCells.value,
      ...firstRowCells.value,
      ...workspaceCells.value,
      ...lastColumnCells.value,
      ...lastRowCells.value,
    ]
  })

  watch(() => toValue(opts), (newOpts) => {
    state.value = newOpts
  }, {
    deep: true,
  })

  return {
    columns,
    rows,
    cells,
  }
}
