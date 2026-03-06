import { useState } from 'react'
import { useConflicts } from '../../hooks/useConflicts'
import { useScheduleStore } from '../../store/useScheduleStore'
import { TIME_SLOTS, DAYS_OF_WEEK } from '../../constants/schedule'

export default function ConflictPanel() {
  const conflicts = useConflicts()
  const teachers = useScheduleStore((s) => s.teachers)
  const grades = useScheduleStore((s) => s.grades)
  const [expanded, setExpanded] = useState(true)

  const teacherMap = new Map(teachers.map((t) => [t.id, t]))
  const gradeMap = new Map(grades.map((g) => [g.id, g]))

  const conflictList = [...conflicts.values()]
  const hasConflicts = conflictList.length > 0

  return (
    <div
      className="flex-shrink-0"
      style={{
        borderTop: hasConflicts ? '1px solid rgba(239,68,68,0.4)' : '1px solid #1A2E4A',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-3 text-left transition-colors"
        style={{
          background: hasConflicts
            ? 'linear-gradient(135deg, rgba(127,29,29,0.6) 0%, rgba(69,10,10,0.7) 100%)'
            : 'rgba(15,23,42,0.4)',
        }}
      >
        {hasConflicts ? (
          /* Warning icon when there are conflicts */
          <div className="flex-shrink-0 w-6 h-6 rounded-md bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        ) : (
          /* Check icon when no conflicts */
          <div className="flex-shrink-0 w-6 h-6 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wide ${hasConflicts ? 'text-rose-300' : 'text-emerald-400'}`}>
              Conflictos
            </span>
            {hasConflicts && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none">
                {conflictList.length}
              </span>
            )}
          </div>
          <p className={`text-[10px] mt-0.5 leading-tight ${hasConflicts ? 'text-rose-400/70' : 'text-emerald-600'}`}>
            {hasConflicts
              ? `${conflictList.length} profesor${conflictList.length !== 1 ? 'es asignados' : ' asignado'} en doble turno`
              : 'Horario sin conflictos'}
          </p>
        </div>

        {hasConflicts && (
          <svg
            className={`w-3.5 h-3.5 text-rose-500 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Conflict list */}
      {hasConflicts && expanded && (
        <div className="max-h-52 overflow-y-auto" style={{ background: 'rgba(20,10,10,0.6)' }}>
          {conflictList.map((c, i) => {
            const teacher = teacherMap.get(c.teacherId)
            const slot = TIME_SLOTS.find((s) => s.id === c.slotId)
            const day = DAYS_OF_WEEK.find((d) => d.id === c.day)
            return (
              <div
                key={i}
                className="px-3 py-2.5 transition-colors hover:bg-rose-950/30"
                style={{ borderTop: '1px solid rgba(239,68,68,0.12)' }}
              >
                {/* Teacher name with color stripe */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-1 h-8 rounded-full flex-shrink-0 ${teacher?.color ?? 'bg-slate-500'}`} />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-100 truncate block">
                      {teacher?.name ?? 'Desconocido'}
                    </span>
                    {/* Grades badges */}
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {c.gradeIds.map((id) => (
                        <span
                          key={id}
                          className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700/40 uppercase tracking-wide"
                        >
                          {gradeMap.get(id)?.label ?? '?'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Day + slot */}
                <div className="flex items-center gap-1.5 text-[10px] text-rose-400/80 pl-3">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{day?.label} · {slot?.label}</span>
                  <span className="text-slate-600 font-time">
                    {slot?.startTime}–{slot?.endTime}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
