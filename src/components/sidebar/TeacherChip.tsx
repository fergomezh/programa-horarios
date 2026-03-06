import type { Teacher } from '../../types'
import { getSubjectColor } from '../../constants/schedule'

interface Props {
  teacher: Teacher
  hasConflict?: boolean
  isOverlay?: boolean
}

export default function TeacherChip({ teacher, hasConflict, isOverlay }: Props) {
  const subjectLabel = teacher.subjects.join(' · ')
  const subjectColor = teacher.subjects[0] ? getSubjectColor(teacher.subjects[0]) : teacher.color

  return (
    <div
      className={`
        relative flex items-center gap-2 rounded-md overflow-hidden
        bg-slate-800/60 border border-slate-700/50
        ${isOverlay ? 'shadow-2xl scale-105 border-slate-600' : 'hover:bg-slate-800 hover:border-slate-600/70'}
        transition-all
      `}
    >
      <div className={`absolute left-0 inset-y-0 w-1 ${subjectColor}`} />

      <div className="flex items-center justify-between w-full pl-3 pr-2 py-2 gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-100 truncate leading-tight">{teacher.name}</div>
          <div className="text-xs text-slate-400 truncate leading-tight mt-0.5" title={subjectLabel}>
            {subjectLabel}
          </div>
        </div>

        {hasConflict && (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center">
            <span className="text-rose-400 text-xs font-bold leading-none">!</span>
          </div>
        )}

        <div className="flex-shrink-0 grid grid-cols-2 gap-0.5 opacity-25">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-0.5 h-0.5 rounded-full bg-slate-400" />
          ))}
        </div>
      </div>
    </div>
  )
}
