import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { DayOfWeek, DraggableTeacherData, Teacher } from '../../types'
import TeacherChip from './TeacherChip'

interface Props {
  teacher: Teacher
  subject: string
  gradeId: string
  slotId: string
  day: DayOfWeek
  hasConflict: boolean
  onRemove: () => void
}

export default function DraggableTeacherChip({ teacher, subject, gradeId, slotId, day, hasConflict, onRemove }: Props) {
  const draggableId = `chip-${gradeId}-${slotId}-${day}`

  const data: DraggableTeacherData = {
    type: 'teacher',
    teacherId: teacher.id,
    sourceGradeId: gradeId,
    sourceSlotId: slotId,
    sourceDay: day,
  }

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: draggableId,
    data,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing w-full"
      onContextMenu={(e) => {
        e.preventDefault()
        onRemove()
      }}
    >
      <TeacherChip teacher={teacher} subject={subject} hasConflict={hasConflict} />
    </div>
  )
}
