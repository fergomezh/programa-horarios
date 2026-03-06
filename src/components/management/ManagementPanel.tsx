import { useState } from 'react'
import TeacherManager from './TeacherManager'
import GradeManager from './GradeManager'
import SubjectLimitsManager from './SubjectLimitsManager'
import { useScheduleStore } from '../../store/useScheduleStore'

type Tab = 'teachers' | 'grades' | 'limits'

export default function ManagementPanel() {
  const [tab, setTab] = useState<Tab>('teachers')
  const loadSampleData = useScheduleStore((s) => s.loadSampleData)
  const teachers = useScheduleStore((s) => s.teachers)
  const grades = useScheduleStore((s) => s.grades)

  const isEmpty = teachers.length === 0 && grades.length === 0

  return (
    <div className="h-full overflow-y-auto">
      {/* ── Sub-tab bar (underline style — subordinate to main crimson pills) ── */}
      <div className="flex items-center justify-between px-6 border-b border-slate-200 bg-slate-50 sticky top-0">
        <div className="flex gap-0">
          <button
            onClick={() => setTab('teachers')}
            className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px whitespace-nowrap ${
              tab === 'teachers'
                ? 'border-crimson-600 text-crimson-700'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
            }`}
          >
            Profesores
          </button>
          <button
            onClick={() => setTab('grades')}
            className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px whitespace-nowrap ${
              tab === 'grades'
                ? 'border-crimson-600 text-crimson-700'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
            }`}
          >
            Grados
          </button>
          <button
            onClick={() => setTab('limits')}
            className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px whitespace-nowrap ${
              tab === 'limits'
                ? 'border-crimson-600 text-crimson-700'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
            }`}
          >
            Límites
          </button>
        </div>

        {isEmpty && (
          <button
            onClick={loadSampleData}
            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Cargar datos de ejemplo
          </button>
        )}
      </div>

      {tab === 'teachers' && <TeacherManager />}
      {tab === 'grades' && <GradeManager />}
      {tab === 'limits' && <SubjectLimitsManager />}
    </div>
  )
}
