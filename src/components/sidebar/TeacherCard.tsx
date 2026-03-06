import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Teacher } from '../../types'
import type { DraggableTeacherData } from '../../types'
import TeacherChip from './TeacherChip'

interface Props {
  teacher: Teacher
  hasConflict: boolean
  draggable?: boolean
  onClick?: () => void
}

function DraggableCard({ teacher, hasConflict }: { teacher: Teacher; hasConflict: boolean }) {
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

export default function TeacherCard({ teacher, hasConflict, draggable = true, onClick }: Props) {
  if (draggable) {
    return <DraggableCard teacher={teacher} hasConflict={hasConflict} />
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left group cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg"
    >
      <TeacherChip teacher={teacher} hasConflict={hasConflict} />
    </button>
  )
}
