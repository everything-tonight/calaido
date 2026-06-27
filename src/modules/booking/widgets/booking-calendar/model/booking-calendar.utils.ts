import { addMinutes, differenceInMinutes } from 'date-fns'

export function getTimeSlots(timestampStart: Date, timestampEnd: Date, timestampRange: number) {
  const cells = []

  let minutes = differenceInMinutes(timestampEnd, timestampStart)

  cells.push(timestampStart)

  while (minutes / timestampRange >= 1) {
    const currentTimestamp = addMinutes(timestampStart, timestampRange)

    cells.push(currentTimestamp)

    timestampStart = currentTimestamp
    minutes -= timestampRange
  }

  if (minutes) {
    cells.push(addMinutes(timestampStart, minutes))
  }

  return cells
}
