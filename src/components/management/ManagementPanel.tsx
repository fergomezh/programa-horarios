import { useState } from 'react'
import TeacherManager from './TeacherManager'
import GradeManager from './GradeManager'
import { useScheduleStore } from '../../store/useScheduleStore'

type Tab = 'teachers' | 'grades'

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
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              tab === 'teachers' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Profesores
          </button>
          <button
            onClick={() => setTab('grades')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              tab === 'grades' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Grados
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

      {tab === 'teachers' ? <TeacherManager /> : <GradeManager />}
    </div>
  )
}
