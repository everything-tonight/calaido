export interface CalendarDefaultCell {
  type: 'default'
}

export interface CalendarWorkspaceCell {
  type: 'workspace'
  timestamp: Date
}

export type CalendarCell = (CalendarDefaultCell | CalendarWorkspaceCell) & {
  column: number
  row: number
  width: number
  height: number
}

export interface CalendarCellCoords {
  column: number
  row: number
  subCell: number
}
