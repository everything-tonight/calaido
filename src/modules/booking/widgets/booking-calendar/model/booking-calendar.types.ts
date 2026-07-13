export const CALENDAR_CELL_TYPE = {
  FIRST_COLUMN: 'firstColumn',
  LAST_COLUMN: 'lastColumn',
  FIRST_ROW: 'firstRow',
  LAST_ROW: 'lastRow',
  WORKSPACE: 'workspace',
} as const

export type CalendarCellType = typeof CALENDAR_CELL_TYPE[keyof typeof CALENDAR_CELL_TYPE]

export interface CalendarCellPosition {
  type: CalendarCellType
  timestamp: Date
  column: number
  row: number
  subCells: number
}

export interface CalendarCellStyled extends CalendarCellPosition {
  size: {
    width: number
    height: number
    subCellWidth: number
    subCellHeight: number
  }
  style: string
}
