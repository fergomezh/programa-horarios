import type { Teacher } from '../../types'
import { getSubjectColor } from '../../constants/schedule'

interface Props {
  teacher: Teacher
  subject: string
  isOverlay?: boolean
  hasConflict?: boolean
}

export default function TeacherChip({ teacher, subject, isOverlay, hasConflict }: Props) {
  const subjectColor = getSubjectColor(subject)
  return (
    <div
      className={`
        relative rounded overflow-hidden w-full
        bg-white border
        transition-all duration-150
        ${hasConflict
          ? 'border-rose-300 hover:border-rose-400 hover:shadow-sm hover:shadow-rose-100'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm hover:shadow-slate-100'}
        ${isOverlay
          ? 'shadow-2xl rotate-1 scale-105 border-slate-300'
          : 'hover:-translate-y-px'}
      `}
      style={{ minHeight: 38 }}
    >
      {/* Left color stripe */}
      <div className={`absolute left-0 inset-y-0 w-1.5 ${subjectColor}`} />

      <div className="pl-3 pr-1.5 py-1.5">
        <div className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 truncate leading-tight transition-colors" title={teacher.name}>
          {teacher.name}
        </div>
        <div className="text-xs text-slate-400 group-hover:text-slate-500 truncate leading-tight mt-0.5 transition-colors">{subject}</div>
      </div>

      {hasConflict && (
        <div
          className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full conflict-dot"
          title="Conflicto de horario"
        />
      )}
    </div>
  )
}
