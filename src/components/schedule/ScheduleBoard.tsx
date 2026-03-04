import { useScheduleStore } from '../../store/useScheduleStore'
import { useConflicts } from '../../hooks/useConflicts'
import ScheduleGrid from './ScheduleGrid'

export default function ScheduleBoard() {
  const grades = useScheduleStore((s) => s.grades)
  const activeGradeId = useScheduleStore((s) => s.activeGradeId)
  const setActiveGradeId = useScheduleStore((s) => s.setActiveGradeId)
  const loadSampleData = useScheduleStore((s) => s.loadSampleData)

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
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
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

          return (
            <button
              key={g.id}
              onClick={() => setActiveGradeId(g.id)}
              className={`
                relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap
                transition-all flex-shrink-0
                ${isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            </button>
          )
        })}

        {/* Conflict count summary */}
        {conflicts.size > 0 && (
          <div className="ml-auto flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 conflict-dot" />
            <span className="text-xs font-semibold text-rose-600">
              {conflicts.size} conflicto{conflicts.size !== 1 ? 's' : ''}
            </span>
          </div>
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
    </div>
  )
}
