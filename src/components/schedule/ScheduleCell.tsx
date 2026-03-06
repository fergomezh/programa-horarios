import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { Conflict, DayOfWeek, Teacher } from '../../types'
import type { DroppableCellData } from '../../types'
import { buildCellId } from '../../utils/idHelpers'
import DraggableTeacherChip from './DraggableTeacherChip'
import RemoveConfirmModal from './RemoveConfirmModal'
import { useScheduleStore } from '../../store/useScheduleStore'
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../constants/schedule'
import { useDragHighlight } from '../../context/DragHighlightContext'

interface Props {
  gradeId: string
  slotId: string
  day: DayOfWeek
  teacher: Teacher | null
  subject: string | null
  conflicts: Map<string, Conflict>
}

export default function ScheduleCell({ gradeId, slotId, day, teacher, subject, conflicts }: Props) {
  const removeAssignment = useScheduleStore((s) => s.removeAssignment)
  const grades = useScheduleStore((s) => s.grades)

  const [showConfirm, setShowConfirm] = useState(false)

  const { draggingTeacherId, busySlotKeys } = useDragHighlight()

  const cellId = buildCellId(gradeId, slotId, day)
  const data: DroppableCellData = { type: 'cell', gradeId, slotId, day }

  const { setNodeRef, isOver } = useDroppable({ id: cellId, data })

  const conflictKey = teacher ? `${teacher.id}::${slotId}::${day}` : null
  const conflict = conflictKey ? conflicts.get(conflictKey) : undefined
  const isConflict = !!conflict

  const gradeMap = new Map(grades.map((g) => [g.id, g]))
  const slot = TIME_SLOTS.find((s) => s.id === slotId)
  const dayLabel = DAYS_OF_WEEK.find((d) => d.id === day)?.label ?? day
  const gradeLabel = gradeMap.get(gradeId)?.label ?? gradeId

  let conflictTitle: string | undefined
  if (isConflict && conflict && teacher) {
    const gradeLabels = conflict.gradeIds.map((id) => gradeMap.get(id)?.label ?? id).join(', ')
    conflictTitle = `⚠ Conflicto: ${teacher.name} — ${dayLabel} · ${slot?.label} — Grados: ${gradeLabels}`
  }

  // Drag highlight states
  const isDragging = draggingTeacherId !== null
  const slotKey = `${slotId}::${day}`
  const isSafeTarget = isDragging && !busySlotKeys.has(slotKey)
  const isBlockedTarget = isDragging && busySlotKeys.has(slotKey)

  let borderLeft: string | undefined
  let background: string | undefined

  if (isConflict) {
    borderLeft = '3px solid #f43f5e'
    background = '#fff1f2'
  } else if (isOver && isSafeTarget) {
    borderLeft = '3px solid #10b981'
    background = '#d1fae5'
  } else if (isOver && isBlockedTarget) {
    borderLeft = '3px solid #f43f5e'
    background = '#fff1f2'
  } else if (isOver) {
    borderLeft = '3px solid #3b82f6'
    background = '#eff6ff'
  } else if (isSafeTarget) {
    background = 'rgba(16,185,129,0.09)'
  } else if (isBlockedTarget) {
    background = 'rgba(244,63,94,0.05)'
  }

  const style: React.CSSProperties = {
    height: 52,
    minWidth: 100,
    verticalAlign: 'top',
    padding: '4px',
    transition: 'background 0.12s, border-left 0.12s',
    borderLeft,
    background,
  }

  return (
    <>
      <td
        ref={setNodeRef}
        className={`border border-slate-200 transition-colors ${!isDragging ? 'hover:bg-slate-50/60' : ''}`}
        style={style}
        title={conflictTitle}
      >
        {teacher && subject !== null && (
          <DraggableTeacherChip
            teacher={teacher}
            subject={subject}
            gradeId={gradeId}
            slotId={slotId}
            day={day}
            hasConflict={isConflict}
            onRemove={() => removeAssignment(gradeId, slotId, day)}
            onContextMenu={() => setShowConfirm(true)}
          />
        )}
      </td>

      {showConfirm && teacher && subject !== null && (
        <RemoveConfirmModal
          teacher={teacher}
          subject={subject}
          slotLabel={slot?.label ?? slotId}
          dayLabel={dayLabel}
          gradeLabel={gradeLabel}
          onConfirm={() => {
            setShowConfirm(false)
            removeAssignment(gradeId, slotId, day)
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}
