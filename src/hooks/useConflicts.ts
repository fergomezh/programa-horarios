import { useMemo } from 'react'
import { computeConflicts } from '../utils/conflictDetection'
import { useScheduleStore } from '../store/useScheduleStore'
import type { Conflict } from '../types'

export function useConflicts(): Map<string, Conflict> {
  const assignments = useScheduleStore((s) => s.assignments)
  return useMemo(() => computeConflicts(assignments), [assignments])
}
