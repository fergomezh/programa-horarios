import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Teacher } from '../../types'
import type { DraggableTeacherData } from '../../types'
import TeacherChip from './TeacherChip'

interface Props {
  teacher: Teacher
  hasConflict: boolean
}

export default function TeacherCard({ teacher, hasConflict }: Props) {
  const data: DraggableTeacherData = {
    type: 'teacher',
    teacherId: teacher.id,
    sourceGradeId: null,
    sourceSlotId: null,
    sourceDay: null,
  }

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sidebar-${teacher.id}`,
    data,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group cursor-grab active:cursor-grabbing"
    >
      <TeacherChip teacher={teacher} hasConflict={hasConflict} />
    </div>
  )
}
