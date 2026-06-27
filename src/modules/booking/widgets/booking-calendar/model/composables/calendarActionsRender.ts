import type { MaybeRefOrGetter } from 'vue'
import type { CalendarCellCoords } from '../booking-calendar.types'
import { useToggle, watchDeep } from '@vueuse/core'
import { ref, toValue } from 'vue'
import { getCellByPoint, getCellElement } from '../booking-calendar.utils'

interface UseCalendarActionsRenderOptions {
  container: HTMLElement | null
  subCellsCount: number
}

function getSubCellPosition(cellElement: HTMLElement, clientY: number, subCellsCount: number): number {
  const rect = cellElement.getBoundingClientRect()
  const subCellHeight = rect.height / subCellsCount

  return Math.min(
    Math.max(Math.floor((clientY - rect.top) / subCellHeight), 0),
    subCellsCount - 1,
  )
}

export function useCalendarActionsRender(opts: MaybeRefOrGetter<UseCalendarActionsRenderOptions>) {
  const state = ref(toValue(opts))

  const [isAreaSelecting, toggleIsAreaSelecting] = useToggle()

  let startCellCoords: CalendarCellCoords | null = null
  let endCellCoords: CalendarCellCoords | null = null
  let selectionOverlay: HTMLDivElement | null = null

  function createSelectionOverlay() {
    if (selectionOverlay || !state.value.container)
      return

    selectionOverlay = document.createElement('div')

    Object.assign(selectionOverlay.style, {
      position: 'absolute',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      border: '2px solid rgba(59, 130, 246, 0.4)',
      borderRadius: '8px',
      pointerEvents: 'none',
    })

    state.value.container.appendChild(selectionOverlay)
  }

  function updateSelectionOverlay() {
    if (!selectionOverlay || !startCellCoords || !endCellCoords || !state.value.container)
      return

    const { subCellsCount } = state.value

    const minCol = Math.min(startCellCoords.column, endCellCoords.column)
    const maxCol = Math.max(startCellCoords.column, endCellCoords.column)
    const minRow = Math.min(startCellCoords.row, endCellCoords.row)
    const maxRow = Math.max(startCellCoords.row, endCellCoords.row)

    const minCellElement = getCellElement(minCol, minRow)
    const maxCellElement = getCellElement(maxCol, maxRow)

    if (!minCellElement || !maxCellElement)
      return

    const containerRect = state.value.container.getBoundingClientRect()
    const minCellRect = minCellElement.getBoundingClientRect()
    const maxCellRect = maxCellElement.getBoundingClientRect()

    const subCellHeight = minCellRect.height / subCellsCount

    const isStartAtTop = startCellCoords.row === minRow
    const isEndAtTop = endCellCoords.row === minRow
    const isStartAtBottom = startCellCoords.row === maxRow
    const isEndAtBottom = endCellCoords.row === maxRow

    const topSubCell = isStartAtTop && isEndAtTop
      ? Math.min(startCellCoords.subCell, endCellCoords.subCell)
      : isStartAtTop
        ? startCellCoords.subCell
        : isEndAtTop
          ? endCellCoords.subCell
          : 0

    const bottomSubCell = isStartAtBottom && isEndAtBottom
      ? Math.max(startCellCoords.subCell, endCellCoords.subCell)
      : isStartAtBottom
        ? startCellCoords.subCell
        : isEndAtBottom
          ? endCellCoords.subCell
          : subCellsCount - 1

    const isExplicitBottomBoundary = isStartAtBottom || isEndAtBottom

    const top = minCellRect.top + topSubCell * subCellHeight
    const bottom = maxCellRect.top + (bottomSubCell + 1) * subCellHeight
      - (isExplicitBottomBoundary && bottomSubCell === subCellsCount - 1 ? 1 : 0)

    const scrollLeft = state.value.container.scrollLeft
    const scrollTop = state.value.container.scrollTop

    Object.assign(selectionOverlay.style, {
      left: `${minCellRect.left - containerRect.left + scrollLeft}px`,
      top: `${top - containerRect.top + scrollTop}px`,
      width: `${maxCellRect.right - minCellRect.left}px`,
      height: `${bottom - top}px`,
    })
  }

  function removeOverlay() {
    if (selectionOverlay) {
      selectionOverlay.remove()
      selectionOverlay = null
    }
  }

  const startAreaSelecting = (e: PointerEvent) => {
    const point = getCellByPoint(e.clientX, e.clientY)

    if (!point)
      return

    const { column, row } = point

    const cellElement = getCellElement(column, row)

    if (!cellElement)
      return

    const subCell = getSubCellPosition(cellElement, e.clientY, state.value.subCellsCount)

    toggleIsAreaSelecting(true)
    removeOverlay()

    startCellCoords = { column, row, subCell }
    endCellCoords = { column, row, subCell }
  }

  const changeAreaSelecting = (e: PointerEvent) => {
    if (!isAreaSelecting.value)
      return

    const point = getCellByPoint(e.clientX, e.clientY)

    if (!point)
      return

    const cellElement = getCellElement(point.column, point.row)

    if (!cellElement)
      return

    const subCell = getSubCellPosition(cellElement, e.clientY, state.value.subCellsCount)

    endCellCoords = { column: point.column, row: point.row, subCell }

    createSelectionOverlay()
    updateSelectionOverlay()
  }

  const stopAreaSelecting = (_e: PointerEvent) => {
    if (!isAreaSelecting.value)
      return

    toggleIsAreaSelecting(false)

    startCellCoords = null
    endCellCoords = null
  }

  watchDeep(() => toValue(opts), newOpts => state.value = newOpts)

  return {
    startAreaSelecting,
    changeAreaSelecting,
    stopAreaSelecting,
    updateSelectionOverlay,
  }
}
