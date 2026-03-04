import type { DayOfWeek } from '../types'

export function buildCellId(gradeId: string, slotId: string, day: DayOfWeek): string {
  return `${gradeId}::${slotId}::${day}`
}

export function parseCellId(cellId: string): { gradeId: string; slotId: string; day: DayOfWeek } {
  const [gradeId, slotId, day] = cellId.split('::')
  return { gradeId, slotId, day: day as DayOfWeek }
}
