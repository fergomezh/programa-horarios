import type { DayOfWeek } from '../../types'
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../constants/schedule'

interface Props {
  targetGradeLabel: string
  existingTeacherName: string
  existingTeacherColor: string
  existingSubject: string
  sourceTeacherName: string
  sourceTeacherColor: string
  sourceSubject: string
  day: DayOfWeek
  slotId: string
  onReplace: () => void
  onCancel: () => void
}

export default function OccupiedCellModal({
  targetGradeLabel,
  existingTeacherName,
  existingTeacherColor,
  existingSubject,
  sourceTeacherName,
  sourceTeacherColor,
  sourceSubject,
  day,
  slotId,
  onReplace,
  onCancel,
}: Props) {
  const slot = TIME_SLOTS.find((s) => s.id === slotId)
  const dayLabel = DAYS_OF_WEEK.find((d) => d.id === day)?.label ?? day

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-amber-50 px-5 py-4 border-b border-amber-100 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-tight">Celda ocupada</h2>
            <p className="text-xs text-amber-600 mt-0.5">
              {dayLabel} · {slot?.label}
              {slot && <span className="text-amber-400"> ({slot.startTime}–{slot.endTime})</span>}
            </p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-xs text-slate-500">
            Ya hay una clase asignada en este horario:
          </p>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50">
            <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-amber-600 text-white text-[11px] font-bold leading-none">
              {targetGradeLabel}
            </span>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${existingTeacherColor}`} />
              <span className="text-sm font-semibold text-slate-700">{existingTeacherName}</span>
              <span className="text-xs text-amber-700">→ {existingSubject}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            ¿Deseas reemplazar con:
          </p>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${sourceTeacherColor}`} />
              <span className="text-sm font-semibold text-slate-700">{sourceTeacherName}</span>
              <span className="text-xs text-emerald-700">→ {sourceSubject}</span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onReplace}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Reemplazar
          </button>
        </div>
      </div>
    </div>
  )
}
