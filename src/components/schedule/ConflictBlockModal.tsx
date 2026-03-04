import type { DayOfWeek } from '../../types'
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../constants/schedule'

interface ConflictEntry {
  gradeLabel: string
  subject: string
}

interface Props {
  teacherName: string
  teacherColor: string
  day: DayOfWeek
  slotId: string
  conflictingEntries: ConflictEntry[]
  onClose: () => void
}

export default function ConflictBlockModal({
  teacherName,
  teacherColor,
  day,
  slotId,
  conflictingEntries,
  onClose,
}: Props) {
  const slot = TIME_SLOTS.find((s) => s.id === slotId)
  const dayLabel = DAYS_OF_WEEK.find((d) => d.id === day)?.label ?? day

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-rose-50 px-5 py-4 border-b border-rose-100 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-tight">Profesor no disponible</h2>
            <p className="text-xs text-rose-600 mt-0.5">
              {dayLabel} · {slot?.label}
              {slot && <span className="text-rose-400"> ({slot.startTime}–{slot.endTime})</span>}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {/* Teacher pill */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${teacherColor}`} />
            <span className="text-sm font-semibold text-slate-700">{teacherName}</span>
          </div>

          <p className="text-xs text-slate-500">
            Ya tiene {conflictingEntries.length === 1 ? 'una clase asignada' : 'clases asignadas'} en este mismo horario:
          </p>

          {/* Conflicting grades with subjects */}
          <div className="space-y-2">
            {conflictingEntries.map((entry) => (
              <div
                key={entry.gradeLabel}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-rose-200 bg-rose-50"
              >
                {/* Grade badge */}
                <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold leading-none">
                  {entry.gradeLabel}
                </span>
                {/* Arrow + subject */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <svg className="w-3 h-3 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  <span className="text-xs font-semibold text-rose-800 truncate">{entry.subject}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            Un profesor no puede estar en dos salones al mismo tiempo. Elige otro profesor o un horario diferente.
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
