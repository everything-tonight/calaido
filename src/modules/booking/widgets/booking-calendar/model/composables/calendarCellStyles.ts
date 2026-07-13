import type { MaybeRefOrGetter } from 'vue'
import type { CalendarCellPosition, CalendarCellStyled, CalendarCellType } from '../booking-calendar.types'
import { computed, onScopeDispose, ref, toValue, watch } from 'vue'
import { CALENDAR_CELL_TYPE } from '../booking-calendar.types'

const DEFAULT_SIZE: CalendarCellStyled['size'] = {
  width: 0,
  height: 0,
  subCellWidth: 0,
  subCellHeight: 0,
}

export function useCalendarCellStyles(container: MaybeRefOrGetter<HTMLElement | null>, cells: MaybeRefOrGetter<CalendarCellPosition[]>) {
  const cellsContainer = ref(toValue(container))
  const unstyledCells = ref(toValue(cells))

  const sizes = ref<Record<CalendarCellType, CalendarCellStyled['size']>>({
    [CALENDAR_CELL_TYPE.FIRST_COLUMN]: { ...DEFAULT_SIZE },
    [CALENDAR_CELL_TYPE.LAST_COLUMN]: { ...DEFAULT_SIZE },
    [CALENDAR_CELL_TYPE.FIRST_ROW]: { ...DEFAULT_SIZE },
    [CALENDAR_CELL_TYPE.LAST_ROW]: { ...DEFAULT_SIZE },
    [CALENDAR_CELL_TYPE.WORKSPACE]: { ...DEFAULT_SIZE },
  })

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const container = entry.target

      if (container) {
        const cells = container.querySelectorAll('time')

        if (cells.length === 0)
          return

        for (const cell of cells) {
          const type = cell.dataset.cellType as CalendarCellType | undefined

          if (!type)
            continue

          const width = cell.offsetWidth
          const height = cell.offsetHeight

          sizes.value[type] = {
            width,
            height,
            subCellWidth: width,
            subCellHeight: height / unstyledCells.value[0].subCells,
          }
        }
      }
    }
  })

  const styledCells = computed(() => {
    const result: CalendarCellStyled[] = []

    for (const unstyledCell of unstyledCells.value) {
      result.push({
        ...unstyledCell,
        size: sizes.value[unstyledCell.type],
        style: `grid-column: ${unstyledCell.column}; grid-row: ${unstyledCell.row};`,
      })
    }

    return result
  })

  watch(() => toValue(container), (newContainer) => {
    if (cellsContainer.value) {
      resizeObserver.unobserve(cellsContainer.value)
    }

    if (newContainer) {
      resizeObserver.observe(newContainer)
    }

    cellsContainer.value = newContainer
  })

  watch(() => toValue(cells), (newCells) => {
    unstyledCells.value = newCells
  }, { deep: true })

  onScopeDispose(() => {
    if (cellsContainer.value) {
      resizeObserver.unobserve(cellsContainer.value)
    }
  })

  return {
    cells: styledCells,
  }
}
