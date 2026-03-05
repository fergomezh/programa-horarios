import { useEffect } from 'react'
import { useScheduleStore } from '../store/useScheduleStore'
import { useAuth } from '../hooks/useAuth'
import { TIME_SLOTS, DAYS_OF_WEEK } from '../constants/schedule'
import PrintButton from '../components/pdf/PrintButton'

export default function TeacherView() {
  const { user, logout } = useAuth()
  const teachers = useScheduleStore((s) => s.teachers)
  const grades = useScheduleStore((s) => s.grades)
  const assignments = useScheduleStore((s) => s.assignments)
  const initStore = useScheduleStore((s) => s.initStore)

  useEffect(() => {
    initStore()
  }, [])

  const teacher = teachers.find((t) => t.id === user?.teacherId) ?? null
  const gradeMap = new Map(grades.map((g) => [g.id, g]))

  // Assignments for this teacher only
  const myAssignments = assignments.filter((a) => a.teacherId === user?.teacherId)

  function getCellContent(slotId: string, day: string) {
    const a = myAssignments.find((a) => a.slotId === slotId && a.day === day)
    if (!a) return null
    const grade = gradeMap.get(a.gradeId)
    return { gradeLabel: grade?.label ?? '?', subject: a.subject }
  }

  return (
    <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: '#0c1424', borderBottom: '1px solid #1e2d42' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Colegio Lamatepec</h1>
            <p className="text-xs text-slate-500">Mi Horario</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400">{user?.email}</p>
            <p className="text-xs text-blue-400 font-medium">{teacher?.name ?? 'Profesor'}</p>
          </div>
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {teacher ? teacher.name : 'Mi Horario'}
            </h2>
            {teacher && (
              <p className="text-sm text-slate-500">
                {teacher.subjects.join(' · ')}
              </p>
            )}
          </div>
          {teacher && (
            <PrintButton
              label="Descargar PDF"
              documentType="teacher"
              teacher={teacher}
              assignments={myAssignments}
              grades={grades}
            />
          )}
        </div>

        {/* Schedule table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[600px]">
            <thead>
              <tr style={{ background: '#0c1424' }}>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-400 w-28">Hora</th>
                {DAYS_OF_WEEK.map((d) => (
                  <th key={d.id} className="px-3 py-2.5 text-center text-xs font-semibold text-slate-300">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot) => {
                if (slot.isBreak) {
                  return (
                    <tr key={slot.id} style={{ background: '#f8fafc' }}>
                      <td colSpan={6} className="px-3 py-1.5 text-center text-xs text-slate-400 font-medium border-y border-slate-100">
                        {slot.breakLabel} · {slot.startTime}–{slot.endTime}
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr key={slot.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">
                      <div className="font-medium text-slate-700">{slot.label}</div>
                      <div className="text-slate-400">{slot.startTime}–{slot.endTime}</div>
                    </td>
                    {DAYS_OF_WEEK.map((d) => {
                      const cell = getCellContent(slot.id, d.id)
                      return (
                        <td key={d.id} className="px-3 py-2 text-center border-l border-slate-100">
                          {cell ? (
                            <div className="space-y-0.5">
                              <div className="text-xs font-semibold text-slate-700">{cell.gradeLabel}</div>
                              <div className="text-xs text-slate-500">{cell.subject}</div>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
