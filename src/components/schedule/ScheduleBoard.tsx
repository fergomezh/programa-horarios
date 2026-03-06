import { useMemo } from 'react'
import { useScheduleStore } from '../../store/useScheduleStore'
import { useConflicts } from '../../hooks/useConflicts'
import { TIME_SLOTS } from '../../constants/schedule'
import ScheduleGrid from './ScheduleGrid'
import PrintButton from '../pdf/PrintButton'

const CLASS_SLOT_IDS = new Set(TIME_SLOTS.filter((s) => !s.isBreak).map((s) => s.id))

export default function ScheduleBoard() {
  const grades = useScheduleStore((s) => s.grades)
  const teachers = useScheduleStore((s) => s.teachers)
  const assignments = useScheduleStore((s) => s.assignments)
  const activeGradeId = useScheduleStore((s) => s.activeGradeId)
  const setActiveGradeId = useScheduleStore((s) => s.setActiveGradeId)
  const loadSampleData = useScheduleStore((s) => s.loadSampleData)
  const subjectLimits = useScheduleStore((s) => s.subjectLimits)

  const conflicts = useConflicts()

  // Compute which grades have conflicts
  const gradesWithConflicts = new Set<string>()
  for (const conflict of conflicts.values()) {
    for (const gradeId of conflict.gradeIds) {
      gradesWithConflicts.add(gradeId)
    }
  }

  const activeGrade = grades.find((g) => g.id === activeGradeId) ?? grades[0] ?? null
  const effectiveActiveId = activeGradeId ?? grades[0]?.id

  const gradeOffTarget = useMemo(() => {
    const map = new Map<string, number>()
    for (const grade of grades) {
      const limits = subjectLimits[grade.id] ?? {}
      for (const [subject, limit] of Object.entries(limits)) {
        if (limit === 0) continue
        const count = assignments.filter(
          (a) => a.gradeId === grade.id && a.subject === subject && CLASS_SLOT_IDS.has(a.slotId),
        ).length
        if (count !== limit) map.set(grade.id, (map.get(grade.id) ?? 0) + 1)
      }
    }
    return map
  }, [grades, assignments, subjectLimits])

  const requirementsSummary = useMemo(() => {
    if (!activeGradeId) return []
    const limits = subjectLimits[activeGradeId] ?? {}
    return Object.entries(limits)
      .filter(([, limit]) => limit > 0)
      .map(([subject, limit]) => {
        const count = assignments.filter(
          (a) => a.gradeId === activeGradeId && a.subject === subject && CLASS_SLOT_IDS.has(a.slotId),
        ).length
        return { subject, limit, count }
      })
      .sort((a, b) => a.subject.localeCompare(b.subject))
  }, [activeGradeId, assignments, subjectLimits])

  if (grades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-slate-500 text-sm mb-1 font-medium">Sin grados configurados</p>
        <p className="text-slate-400 text-xs mb-5">
          Agrega grados en <strong className="text-slate-500">Gestionar</strong> o carga datos de ejemplo
        </p>
        <button
          onClick={loadSampleData}
          className="px-5 py-2.5 bg-crimson-600 text-white text-sm font-semibold rounded-lg hover:bg-crimson-700 transition-colors shadow-sm"
        >
          Cargar datos de ejemplo
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Grade tabs */}
      <div
        className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto flex-shrink-0 border-b border-slate-200"
        style={{ background: '#fff', minHeight: 46 }}
      >
        <span className="text-xs text-slate-400 font-medium mr-1 flex-shrink-0">Grado:</span>
        {grades.map((g) => {
          const isActive = g.id === effectiveActiveId
          const hasConflict = gradesWithConflicts.has(g.id)
          const offTargetCount = gradeOffTarget.get(g.id) ?? 0
          const isOffTarget = offTargetCount > 0

          return (
            <button
              key={g.id}
              onClick={() => setActiveGradeId(g.id)}
              className={`
                relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap
                transition-all flex-shrink-0
                ${isActive
                  ? 'bg-crimson-600 text-white shadow-sm hover:bg-crimson-700 active:scale-95'
                  : 'bg-slate-100 text-slate-600 hover:bg-crimson-50 hover:text-crimson-700 hover:border hover:border-crimson-200 active:scale-95'
                }
              `}
            >
              {g.label}
              {hasConflict && (
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    isActive ? 'bg-rose-300' : 'bg-rose-500'
                  } conflict-dot`}
                  title="Este grado tiene conflictos"
                />
              )}
              {isOffTarget && (
                <span
                  className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex-shrink-0 ${
                    isActive ? 'bg-amber-300 text-amber-900' : 'bg-amber-500 text-white'
                  }`}
                  title={`${offTargetCount} materia${offTargetCount !== 1 ? 's' : ''} pendiente${offTargetCount !== 1 ? 's' : ''}`}
                >
                  {offTargetCount}
                </span>
              )}
            </button>
          )
        })}

        <div className="ml-auto flex-shrink-0 flex items-center gap-2">
          {/* Conflict count summary */}
          {conflicts.size > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 conflict-dot" />
              <span className="text-xs font-semibold text-rose-600">
                {conflicts.size} conflicto{conflicts.size !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar: badges + objectives for active grade */}
      <div
        className="flex items-center gap-2 px-4 py-2 overflow-x-auto flex-shrink-0 border-b border-slate-200"
        style={{ background: '#f8fafc', minHeight: 40 }}
      >
        {conflicts.size > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 conflict-dot" />
            <span className="text-xs font-semibold text-rose-600">
              {conflicts.size} conflicto{conflicts.size !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {requirementsSummary.length > 0 && (
          <>
            {conflicts.size > 0 && (
              <div className="w-px h-4 bg-slate-300 flex-shrink-0" />
            )}
            <span className="text-[11px] text-slate-400 font-medium flex-shrink-0">Objetivos:</span>
            {requirementsSummary.map(({ subject, limit, count }) => {
              const missing = limit - count
              const isComplete = count === limit
              const isOver = count > limit

              return (
                <div
                  key={subject}
                  title={
                    isComplete
                      ? `${subject}: objetivo cumplido`
                      : isOver
                      ? `${subject}: excede en ${count - limit} hora${count - limit !== 1 ? 's' : ''}`
                      : `${subject}: faltan ${missing} hora${missing !== 1 ? 's' : ''}`
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${
                    isOver
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : isComplete
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}
                >
                  <span className="truncate max-w-[90px]">{subject}</span>
                  <span
                    className={`font-bold tabular-nums flex-shrink-0 ${
                      isOver ? 'text-rose-600' : isComplete ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {count}/{limit}
                  </span>
                  {isComplete && (
                    <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {!isComplete && !isOver && (
                    <span className="text-amber-500 flex-shrink-0 font-bold">−{missing}</span>
                  )}
                  {isOver && (
                    <span className="text-rose-500 flex-shrink-0 font-bold">+{count - limit}</span>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Schedule grid */}
      <div className="flex-1 overflow-auto p-4" style={{ background: '#f8fafc' }}>
        {activeGrade && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <ScheduleGrid grade={activeGrade} conflicts={conflicts} />
          </div>
        )}
      </div>

      {/* PDF download button - below the schedule */}
      <div className="flex justify-center px-4 pb-4 flex-shrink-0">
        {activeGrade && (
          <PrintButton
            documentType="grade"
            grade={activeGrade}
            assignments={assignments}
            teachers={teachers}
          />
        )}
      </div>
    </div>
  )
}
