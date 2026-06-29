import type { MaybeRefOrGetter } from 'vue'
import type { CalendarCellCoords } from '../booking-calendar.types'
import { cn } from ':modules/core/shared/utils'
import { useToggle, watchDeep } from '@vueuse/core'
import { ref, toValue } from 'vue'
import { getCellByPoint, getCellElement, getSubCellPosition } from '../booking-calendar.utils'

interface UseCalendarOverlayRenderOptions {
  container: HTMLElement | null
  overlayClasses: string[]
  subCellsCount: number
  subCellsHeight: number
}

interface UseCalendarOverlayRenderState extends UseCalendarOverlayRenderOptions {
  startCellCoords: CalendarCellCoords | null
  endCellCoords: CalendarCellCoords | null
  selectionOverlay: HTMLDivElement | null
}

export function useCalendarOverlayRender(opts: MaybeRefOrGetter<UseCalendarOverlayRenderOptions>) {
  const state = ref<UseCalendarOverlayRenderState>({
    ...toValue(opts),
    startCellCoords: null,
    endCellCoords: null,
    selectionOverlay: null,
  })

  const [isAreaSelecting, toggleIsAreaSelecting] = useToggle()

  function createSelectionOverlay() {
    if (state.value.selectionOverlay || !state.value.container)
      return

    state.value.selectionOverlay = document.createElement('div')

    state.value.selectionOverlay.className = cn('absolute pointer-events-none', state.value.overlayClasses)

    state.value.container.appendChild(state.value.selectionOverlay)
  }

  function updateSelectionOverlay() {
    if (!state.value.selectionOverlay || !state.value.startCellCoords || !state.value.endCellCoords || !state.value.container)
      return

    const start = state.value.startCellCoords
    const end = state.value.endCellCoords

    const minCol = Math.min(start.column, end.column)
    const maxCol = Math.max(start.column, end.column)
    const minRow = Math.min(start.row, end.row)
    const maxRow = Math.max(start.row, end.row)

    const minCellElement = getCellElement(minCol, minRow)
    const maxCellElement = getCellElement(maxCol, maxRow)

    if (!minCellElement || !maxCellElement)
      return

    const containerRect = state.value.container.getBoundingClientRect()
    const minCellRect = minCellElement.getBoundingClientRect()
    const maxCellRect = maxCellElement.getBoundingClientRect()

    const isStartAtTop = start.row === minRow
    const isEndAtTop = end.row === minRow
    const isStartAtBottom = start.row === maxRow
    const isEndAtBottom = end.row === maxRow

    const topSubCell = isStartAtTop && isEndAtTop
      ? Math.min(start.subCell, end.subCell)
      : isStartAtTop
        ? start.subCell
        : isEndAtTop
          ? end.subCell
          : 0

    const bottomSubCell = isStartAtBottom && isEndAtBottom
      ? Math.max(start.subCell, end.subCell)
      : isStartAtBottom
        ? start.subCell
        : isEndAtBottom
          ? end.subCell
          : state.value.subCellsCount - 1

    const isExplicitBottomBoundary = isStartAtBottom || isEndAtBottom

    const top = minCellRect.top + topSubCell * state.value.subCellsHeight
    const bottom = maxCellRect.top + (bottomSubCell + 1) * state.value.subCellsHeight
      - (isExplicitBottomBoundary && bottomSubCell === state.value.subCellsCount - 1 ? 1 : 0)

    const scrollLeft = state.value.container.scrollLeft
    const scrollTop = state.value.container.scrollTop

    const left = minCellRect.left - containerRect.left + scrollLeft
    const overlayTop = top - containerRect.top + scrollTop
    const width = maxCellRect.right - minCellRect.left
    const height = bottom - top

    Object.assign(state.value.selectionOverlay.style, {
      left: `${left}px`,
      top: `${overlayTop}px`,
      width: `${width}px`,
      height: `${height}px`,
    })
  }

  function removeOverlay() {
    if (state.value.selectionOverlay) {
      state.value.selectionOverlay.remove()
      state.value.selectionOverlay = null
    }
  }

  const startAreaSelecting = (e: PointerEvent) => {
    const cell = getCellByPoint(e.clientX, e.clientY)

    if (!cell)
      return

    const { column, row } = cell

    const cellElement = getCellElement(column, row)

    if (!cellElement)
      return

    const subCell = getSubCellPosition(cellElement, e.clientY, state.value.subCellsCount)

    toggleIsAreaSelecting(true)
    removeOverlay()

    state.value.startCellCoords = { column, row, subCell }
    state.value.endCellCoords = { column, row, subCell }
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

    state.value.endCellCoords = { column: point.column, row: point.row, subCell }

    createSelectionOverlay()
    updateSelectionOverlay()
  }

  const stopAreaSelecting = () => {
    if (!isAreaSelecting.value)
      return

    toggleIsAreaSelecting(false)

    state.value.startCellCoords = null
    state.value.endCellCoords = null
  }

  watchDeep(() => toValue(opts), newOpts => state.value = { ...state.value, ...newOpts })

  return {
    startAreaSelecting,
    changeAreaSelecting,
    stopAreaSelecting,
    updateSelectionOverlay,
  }
}
