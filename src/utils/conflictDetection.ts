import type { Assignment, Conflict, DayOfWeek } from '../types'

export function computeConflicts(assignments: Assignment[]): Map<string, Conflict> {
  const map = new Map<string, { teacherId: string; slotId: string; day: DayOfWeek; gradeIds: Set<string> }>()

  for (const a of assignments) {
    const key = `${a.teacherId}::${a.slotId}::${a.day}`
    const existing = map.get(key)
    if (existing) {
      existing.gradeIds.add(a.gradeId)
    } else {
      map.set(key, {
        teacherId: a.teacherId,
        slotId: a.slotId,
        day: a.day,
        gradeIds: new Set([a.gradeId]),
      })
    }
  }

  const conflicts = new Map<string, Conflict>()
  for (const [key, entry] of map) {
    if (entry.gradeIds.size >= 2) {
      conflicts.set(key, {
        teacherId: entry.teacherId,
        slotId: entry.slotId,
        day: entry.day,
        gradeIds: [...entry.gradeIds],
      })
    }
  }

  return conflicts
}

export function wouldConflict(
  assignments: Assignment[],
  teacherId: string,
  slotId: string,
  day: DayOfWeek,
  targetGradeId: string,
  sourceGradeId: string | null,
): boolean {
  for (const a of assignments) {
    if (
      a.teacherId === teacherId &&
      a.slotId === slotId &&
      a.day === day &&
      a.gradeId !== targetGradeId &&
      a.gradeId !== sourceGradeId
    ) {
      return true
    }
  }
  return false
}
