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
    <div className={`border-t flex-shrink-0 ${hasConflicts ? 'border-rose-500/30' : 'border-slate-700/40'}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors ${
          hasConflicts
            ? 'bg-rose-950/50 hover:bg-rose-950/70'
            : 'bg-slate-800/30 hover:bg-slate-800/50'
        }`}
      >
        {/* Status dot */}
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            hasConflicts ? 'bg-rose-400 conflict-dot' : 'bg-emerald-400'
          }`}
        />
        <span
          className={`text-xs font-semibold flex-1 ${
            hasConflicts ? 'text-rose-300' : 'text-emerald-400'
          }`}
        >
          {hasConflicts
            ? `${conflictList.length} conflicto${conflictList.length !== 1 ? 's' : ''} detectado${conflictList.length !== 1 ? 's' : ''}`
            : 'Sin conflictos'}
        </span>
        {hasConflicts && (
          <svg
            className={`w-3 h-3 text-rose-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
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
        <div className="max-h-56 overflow-y-auto bg-slate-900/60">
          {conflictList.map((c, i) => {
            const teacher = teacherMap.get(c.teacherId)
            const slot = TIME_SLOTS.find((s) => s.id === c.slotId)
            const day = DAYS_OF_WEEK.find((d) => d.id === c.day)
            const gradeLabels = c.gradeIds
              .map((id) => gradeMap.get(id)?.label ?? '?')
              .join(' · ')

            return (
              <div
                key={i}
                className="px-3 py-2.5 border-t border-slate-700/40 hover:bg-rose-950/20 transition-colors"
              >
                {/* Teacher name with color dot */}
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${teacher?.color ?? 'bg-slate-500'}`}
                  />
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {teacher?.name ?? 'Desconocido'}
                  </span>
                </div>

                {/* Day + slot */}
                <div className="pl-3.5 flex items-center gap-1 text-xs text-rose-300 font-medium">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{day?.label} · {slot?.label}</span>
                  <span className="text-slate-500 font-time text-[10px]">
                    {slot?.startTime}–{slot?.endTime}
                  </span>
                </div>

                {/* Affected grades */}
                <div className="pl-3.5 mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{gradeLabels}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
