import type { DayOfWeek, Teacher } from '../../types'
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../constants/schedule'

interface Props {
  teacher: Teacher
  slotId: string
  day: DayOfWeek
  onSelect: (subject: string) => void
  onCancel: () => void
}

export default function SubjectPicker({ teacher, slotId, day, onSelect, onCancel }: Props) {
  const slot = TIME_SLOTS.find((s) => s.id === slotId)
  const dayLabel = DAYS_OF_WEEK.find((d) => d.id === day)?.label ?? day

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        className="rounded-xl shadow-2xl p-5 w-full max-w-xs mx-4"
        style={{ background: '#0f1e35', border: '1px solid #1e3a5f' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${teacher.color}`} />
          <h2 className="text-sm font-bold text-white">{teacher.name}</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4 pl-4.5">
          {dayLabel} · {slot?.label} ({slot?.startTime}–{slot?.endTime})
        </p>

        <p className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
          ¿Qué materia impartirá?
        </p>

        <div className="flex flex-col gap-2">
          {teacher.subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => onSelect(subject)}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200
                         transition-colors hover:text-white"
              style={{ background: '#162844', border: '1px solid #1e3a5f' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1d3461'
                e.currentTarget.style.borderColor = '#2d4f8f'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#162844'
                e.currentTarget.style.borderColor = '#1e3a5f'
              }}
            >
              {subject}
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="mt-3 w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-1"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
