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
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white sticky top-0">
        <div className="flex gap-1">
          <button
            onClick={() => setTab('teachers')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              tab === 'teachers' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            Profesores
          </button>
          <button
            onClick={() => setTab('grades')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              tab === 'grades' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            Grados
          </button>
          <button
            onClick={() => setTab('limits')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              tab === 'limits' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
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
