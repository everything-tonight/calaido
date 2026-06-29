import type { MaybeRefOrGetter } from 'vue'
import type { CalendarCellCoords } from '../booking-calendar.types'
import { cn } from ':modules/core/shared/utils'
import { useToggle, watchDeep } from '@vueuse/core'
import { ref, toValue } from 'vue'
import { getCellByPoint, getCellElement, getSubCellPosition } from '../booking-calendar.utils'

interface UseCalendarActionsRenderOptions {
  container: HTMLElement | null
  overlayClasses: string[]
  subCellsCount: number
}

interface UseCalendarActionsRenderState extends UseCalendarActionsRenderOptions {
  startCellCoords: CalendarCellCoords | null
  endCellCoords: CalendarCellCoords | null
  selectionOverlay: HTMLDivElement | null
}

export function useCalendarActionsRender(opts: MaybeRefOrGetter<UseCalendarActionsRenderOptions>) {
  const state = ref<UseCalendarActionsRenderState>({
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

    const minCol = Math.min(state.value.startCellCoords.column, state.value.endCellCoords.column)
    const maxCol = Math.max(state.value.startCellCoords.column, state.value.endCellCoords.column)
    const minRow = Math.min(state.value.startCellCoords.row, state.value.endCellCoords.row)
    const maxRow = Math.max(state.value.startCellCoords.row, state.value.endCellCoords.row)

    const minCellElement = getCellElement(minCol, minRow)
    const maxCellElement = getCellElement(maxCol, maxRow)

    if (!minCellElement || !maxCellElement)
      return

    const containerRect = state.value.container.getBoundingClientRect()
    const minCellRect = minCellElement.getBoundingClientRect()
    const maxCellRect = maxCellElement.getBoundingClientRect()

    const subCellHeight = minCellRect.height / state.value.subCellsCount

    const isStartAtTop = state.value.startCellCoords.row === minRow
    const isEndAtTop = state.value.endCellCoords.row === minRow
    const isStartAtBottom = state.value.startCellCoords.row === maxRow
    const isEndAtBottom = state.value.endCellCoords.row === maxRow

    const topSubCell = isStartAtTop && isEndAtTop
      ? Math.min(state.value.startCellCoords.subCell, state.value.endCellCoords.subCell)
      : isStartAtTop
        ? state.value.startCellCoords.subCell
        : isEndAtTop
          ? state.value.endCellCoords.subCell
          : 0

    const bottomSubCell = isStartAtBottom && isEndAtBottom
      ? Math.max(state.value.startCellCoords.subCell, state.value.endCellCoords.subCell)
      : isStartAtBottom
        ? state.value.startCellCoords.subCell
        : isEndAtBottom
          ? state.value.endCellCoords.subCell
          : state.value.subCellsCount - 1

    const isExplicitBottomBoundary = isStartAtBottom || isEndAtBottom

    const top = minCellRect.top + topSubCell * subCellHeight
    const bottom = maxCellRect.top + (bottomSubCell + 1) * subCellHeight
      - (isExplicitBottomBoundary && bottomSubCell === state.value.subCellsCount - 1 ? 1 : 0)

    const scrollLeft = state.value.container.scrollLeft
    const scrollTop = state.value.container.scrollTop

    Object.assign(state.value.selectionOverlay.style, {
      left: `${minCellRect.left - containerRect.left + scrollLeft}px`,
      top: `${top - containerRect.top + scrollTop}px`,
      width: `${maxCellRect.right - minCellRect.left}px`,
      height: `${bottom - top}px`,
    })
  }

  function removeOverlay() {
    if (state.value.selectionOverlay) {
      state.value.selectionOverlay.remove()
      state.value.selectionOverlay = null
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

  const stopAreaSelecting = (_e: PointerEvent) => {
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
