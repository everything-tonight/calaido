export const CALENDAR_CELL_TYPE = {
  FIRST_COLUMN: 'first-column',
  LAST_COLUMN: 'last-column',
  FIRST_ROW: 'first-row',
  LAST_ROW: 'last-row',
  WORKSPACE: 'workspace',
} as const

export const CALENDAR_DIRECTION = {
  ROW: 'row',
  COLUMN: 'column',
} as const

export type CalendarCellType = typeof CALENDAR_CELL_TYPE[keyof typeof CALENDAR_CELL_TYPE]
export type CalendarDirection = typeof CALENDAR_DIRECTION[keyof typeof CALENDAR_DIRECTION]

export interface CalendarCell {
  column: number
  row: number
  width: number
  height: number
  subCell: number
  subCellWidth: number
  subCellHeight: number
  styles: string
  type: CalendarCellType
}
