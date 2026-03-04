import { useDroppable } from '@dnd-kit/core'
import type { Conflict, DayOfWeek, Teacher } from '../../types'
import type { DroppableCellData } from '../../types'
import { buildCellId } from '../../utils/idHelpers'
import DraggableTeacherChip from './DraggableTeacherChip'
import { useScheduleStore } from '../../store/useScheduleStore'
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../constants/schedule'

interface Props {
  gradeId: string
  slotId: string
  day: DayOfWeek
  teacher: Teacher | null
  conflicts: Map<string, Conflict>
}

export default function ScheduleCell({ gradeId, slotId, day, teacher, conflicts }: Props) {
  const removeAssignment = useScheduleStore((s) => s.removeAssignment)
  const grades = useScheduleStore((s) => s.grades)

  const cellId = buildCellId(gradeId, slotId, day)
  const data: DroppableCellData = { type: 'cell', gradeId, slotId, day }

  const { setNodeRef, isOver } = useDroppable({ id: cellId, data })

  const conflictKey = teacher ? `${teacher.id}::${slotId}::${day}` : null
  const conflict = conflictKey ? conflicts.get(conflictKey) : undefined
  const isConflict = !!conflict

  // Build tooltip for conflict cells
  let conflictTitle: string | undefined
  if (isConflict && conflict && teacher) {
    const gradeMap = new Map(grades.map((g) => [g.id, g]))
    const slot = TIME_SLOTS.find((s) => s.id === slotId)
    const dayLabel = DAYS_OF_WEEK.find((d) => d.id === day)?.label ?? day
    const gradeLabels = conflict.gradeIds.map((id) => gradeMap.get(id)?.label ?? id).join(', ')
    conflictTitle = `⚠ Conflicto: ${teacher.name} — ${dayLabel} · ${slot?.label} — Grados: ${gradeLabels}`
  }

  const style: React.CSSProperties = {
    height: 52,
    minWidth: 120,
    verticalAlign: 'top',
    padding: '4px',
    transition: 'background 0.15s, box-shadow 0.15s',
    borderLeft: isConflict
      ? '3px solid #f43f5e'
      : isOver && teacher
        ? '3px solid #f59e0b'
        : isOver
          ? '3px solid #3b82f6'
          : undefined,
    background: isConflict
      ? '#fff1f2'
      : isOver && teacher
        ? '#fffbeb'
        : isOver
          ? '#eff6ff'
          : undefined,
  }

  return (
    <td
      ref={setNodeRef}
      className="border border-slate-200 hover:bg-slate-50/60 transition-colors"
      style={style}
      title={conflictTitle}
    >
      {teacher && (
        <DraggableTeacherChip
          teacher={teacher}
          gradeId={gradeId}
          slotId={slotId}
          day={day}
          hasConflict={isConflict}
          onRemove={() => removeAssignment(gradeId, slotId, day)}
        />
      )}
    </td>
  )
}
