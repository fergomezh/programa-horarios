import type { Teacher } from '../../types'

interface Props {
  teacher: Teacher
  subject: string
  isOverlay?: boolean
  hasConflict?: boolean
}

export default function TeacherChip({ teacher, subject, isOverlay, hasConflict }: Props) {
  return (
    <div
      className={`
        relative rounded overflow-hidden w-full
        bg-white border
        ${hasConflict ? 'border-rose-300' : 'border-slate-200'}
        ${isOverlay ? 'shadow-2xl rotate-1 scale-105 border-slate-300' : ''}
      `}
      style={{ minHeight: 38 }}
    >
      {/* Left color stripe */}
      <div className={`absolute left-0 inset-y-0 w-1.5 ${teacher.color}`} />

      <div className="pl-3 pr-1.5 py-1.5">
        <div className="text-xs font-semibold text-slate-800 truncate leading-tight" title={teacher.name}>
          {teacher.name}
        </div>
        <div className="text-xs text-slate-500 truncate leading-tight mt-0.5">{subject}</div>
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
