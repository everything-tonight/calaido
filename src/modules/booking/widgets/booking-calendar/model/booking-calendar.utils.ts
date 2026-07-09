import { addMinutes, differenceInMinutes } from 'date-fns'

export function getTimeSlots(timestampStart: Date, timestampEnd: Date, timestampRange: number): Date[] {
  const slots = []

  let minutes = differenceInMinutes(timestampEnd, timestampStart)

  slots.push(timestampStart)

  while (minutes / timestampRange >= 1) {
    const currentTimestamp = addMinutes(timestampStart, timestampRange)

    slots.push(currentTimestamp)

    timestampStart = currentTimestamp
    minutes -= timestampRange
  }

  if (minutes) {
    slots.push(addMinutes(timestampStart, minutes))
  }

  return slots
}

export function getCellByPoint(clientX: number, clientY: number): { column: number, row: number } | undefined {
  const RESERVED_COLUMN = 1
  const RESERVED_ROW = 1

  // elementsFromPoint нужен, чтобы находить ячейку под перетаскиваемыми событиями
  // и другими элементами с pointer-events, которые могут находиться выше ячейки
  const elements = document.elementsFromPoint(clientX, clientY)

  for (const element of elements) {
    const cell = element.closest('time')

    if (!cell)
      continue

    const column = Number.parseInt(cell.getAttribute('data-column') as string)
    const row = Number.parseInt(cell.getAttribute('data-row') as string)

    if (!column || !row || column === RESERVED_COLUMN || row === RESERVED_ROW)
      continue

    return {
      column,
      row,
    }
  }

  return undefined
}

// export function getSubCellPosition(cellElement: HTMLElement, clientY: number, subCellsCount: number): number {
//   const rect = cellElement.getBoundingClientRect()
//   const subCellHeight = rect.height / subCellsCount

//   return Math.min(
//     Math.max(Math.floor((clientY - rect.top) / subCellHeight), 0),
//     subCellsCount - 1,
//   )
// }

// export function getTimestampByCoords(
//   timestampStart: Date,
//   cellDuration: number,
//   subCellDuration: number,
//   row: number,
//   subCell: number,
// ): Date {
//   return addMinutes(
//     timestampStart,
//     (row - 2) * cellDuration + subCell * subCellDuration,
//   )
// }

// export function createFigure(options: { container: HTMLElement | null, start: CalendarCell, end: CalendarCell }) {
//   const {
//     container,
//     start,
//     end,
//   } = options

//   if (!container || !start || !end)
//     return

//   const minCol = Math.min(start.column, end.column)
//   const maxCol = Math.max(start.column, end.column)
//   const minRow = Math.min(start.row, end.row)
//   const maxRow = Math.max(start.row, end.row)

//   const minCellElement = Math.min(minCol, minRow)
//   const maxCellElement = Math.max(maxCol, maxRow)

//   if (!minCellElement || !maxCellElement)
//     return

//   const containerRect = container.getBoundingClientRect()
//   const minCellRect = minCellElement.getBoundingClientRect()
//   const maxCellRect = maxCellElement.getBoundingClientRect()

//   const isStartAtTop = start.row === minRow
//   const isEndAtTop = end.row === minRow
//   const isStartAtBottom = start.row === maxRow
//   const isEndAtBottom = end.row === maxRow

//   const topSubCell = isStartAtTop && isEndAtTop
//     ? Math.min(start.subCell, end.subCell)
//     : isStartAtTop
//       ? start.subCell
//       : isEndAtTop
//         ? end.subCell
//         : 0

//   const bottomSubCell = isStartAtBottom && isEndAtBottom
//     ? Math.max(start.subCell, end.subCell)
//     : isStartAtBottom
//       ? start.subCell
//       : isEndAtBottom
//         ? end.subCell
//         : subCellCount - 1

//   const isExplicitBottomBoundary = isStartAtBottom || isEndAtBottom

//   const top = minCellRect.top + topSubCell * subCellHeight
//   const bottom = maxCellRect.top + (bottomSubCell + 1) * subCellHeight
//     - (isExplicitBottomBoundary && bottomSubCell === subCellCount - 1 ? 1 : 0)

//   const scrollLeft = container.scrollLeft
//   const scrollTop = container.scrollTop

//   const left = minCellRect.left - containerRect.left + scrollLeft
//   const overlayTop = top - containerRect.top + scrollTop
//   const width = maxCellRect.right - minCellRect.left
//   const height = bottom - top

//   return {
//     left: `${left}px`,
//     top: `${overlayTop}px`,
//     width: `${width}px`,
//     height: `${height}px`,
//   }
// }

// function getColumnByItemId(itemId: string | number): number | undefined {
//   const index = items.findIndex(item => (item as any).id === itemId)

//   if (index === -1)
//     return undefined

//   return index + 2
// }

// function getCoordsByTimestamp(timestamp: Date, isEnd = false): CalendarCellCoords | null {
//   if (timestamp < options.timestampStart || timestamp > options.timestampEnd)
//     return null

//   const subCellsCount = cellWorkspaceSubCellsCount.value
//   let totalMinutes = differenceInMinutes(timestamp, options.timestampStart)

//   if (isEnd && totalMinutes > 0 && totalMinutes % options.subCellDuration === 0)
//     totalMinutes -= options.subCellDuration

//   const slotIndex = Math.floor(totalMinutes / options.cellDuration)
//   const subCell = Math.min(
//     subCellsCount - 1,
//     Math.floor((totalMinutes % options.cellDuration) / options.subCellDuration),
//   )

//   return {
//     column: 0,
//     row: 2 + slotIndex,
//     subCell,
//   }
// }
