export interface CalendarCell {
  id: number
  timestamp: Date
  column: number
  row: number
  subCellCount: number
  subCellHeight: number
}

export interface CalendarCellCoords {
  column: number
  row: number
  subCell: number
}
