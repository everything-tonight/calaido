export const CALENDAR_CELL_TYPE = {
  FIRST_COLUMN: 'first-column',
  LAST_COLUMN: 'last-column',
  FIRST_ROW: 'first-row',
  LAST_ROW: 'last-row',
  WORKSPACE: 'workspace',
} as const

export type CalendarCellType = typeof CALENDAR_CELL_TYPE[keyof typeof CALENDAR_CELL_TYPE]

export interface CalendarCell {
  column: number
  row: number
  width: number
  height: number
  subCell: number
  subCellWidth: number
  subCellHeight: number
  timestamp: Date
  styles: string
  type: CalendarCellType
}
