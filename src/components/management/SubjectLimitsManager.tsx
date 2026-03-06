import { useState, useMemo } from 'react'
import { useScheduleStore } from '../../store/useScheduleStore'

export default function SubjectLimitsManager() {
  const teachers = useScheduleStore((s) => s.teachers)
  const grades = useScheduleStore((s) => s.grades)
  const subjectLimits = useScheduleStore((s) => s.subjectLimits)
  const setSubjectLimit = useScheduleStore((s) => s.setSubjectLimit)

  const [selectedGradeId, setSelectedGradeId] = useState<string>(grades[0]?.id ?? '')

  const allSubjects = useMemo(
    () => [...new Set(teachers.flatMap((t) => t.subjects))].sort(),
    [teachers],
  )

  const gradeId = selectedGradeId || grades[0]?.id || ''
  const limitsForGrade = subjectLimits[gradeId] ?? {}

  if (teachers.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        Sin materias definidas. Agrega profesores primero.
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Grade selector */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium text-gray-700 flex-shrink-0">Sección:</label>
        <select
          value={gradeId}
          onChange={(e) => setSelectedGradeId(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-crimson-600"
        >
          {grades.map((g) => (
            <option key={g.id} value={g.id}>{g.label}</option>
          ))}
        </select>
      </div>

      {grades.length === 0 ? (
        <p className="text-sm text-gray-500">Sin secciones definidas. Agrega grados primero.</p>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Materia</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-40">Máx. horas/sem</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allSubjects.map((subject) => {
                const current = limitsForGrade[subject]
                return (
                  <tr key={subject} className={`hover:bg-gray-50 transition-colors ${current === 0 ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-2.5 text-gray-800">
                      <span>{subject}</span>
                      {current === 0 && (
                        <span className="ml-2 text-[10px] font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">bloqueada</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        min={0}
                        value={current ?? ''}
                        placeholder="∞"
                        onChange={(e) => {
                          const raw = e.target.value
                          if (raw === '') { setSubjectLimit(gradeId, subject, null); return }
                          const val = Number(raw)
                          if (!isNaN(val) && val >= 0) setSubjectLimit(gradeId, subject, val)
                        }}
                        className="w-20 text-sm border border-gray-300 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-crimson-600"
                      />
                    </td>
                    <td className="px-2 py-2.5">
                      {current !== undefined && (
                        <button
                          onClick={() => setSubjectLimit(gradeId, subject, null)}
                          title="Quitar límite"
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
