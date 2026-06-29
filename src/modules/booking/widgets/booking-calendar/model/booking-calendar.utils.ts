import { addMinutes, differenceInMinutes } from 'date-fns'

export function getTimeSlots(timestampStart: Date, timestampEnd: Date, timestampRange: number): Date[] {
  const cells = []

  let minutes = differenceInMinutes(timestampEnd, timestampStart)

  cells.push(timestampStart)

  while (minutes / timestampRange >= 1) {
    const currentTimestamp = addMinutes(timestampStart, timestampRange)

    cells.push(currentTimestamp)

    timestampStart = currentTimestamp
    minutes -= timestampRange
  }

  if (minutes) {
    cells.push(addMinutes(timestampStart, minutes))
  }

  return cells
}

export function getCellElement(column: number, row: number): HTMLElement | null {
  return document.querySelector(`time[data-column="${column}"][data-row="${row}"]`)
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

export function getSubCellPosition(cellElement: HTMLElement, clientY: number, subCellsCount: number): number {
  const rect = cellElement.getBoundingClientRect()
  const subCellHeight = rect.height / subCellsCount

  return Math.min(
    Math.max(Math.floor((clientY - rect.top) / subCellHeight), 0),
    subCellsCount - 1,
  )
}
