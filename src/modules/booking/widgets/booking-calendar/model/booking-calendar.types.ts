export interface CalendarCell {
  id: number
  timestamp: Date
  column: number
  row: number
}

export interface CalendarCellCoords {
  column: number
  row: number
  subCell: number
}
