import { useEffect } from 'react'
import { useScheduleStore } from '../store/useScheduleStore'
import { TIME_SLOTS, DAYS_OF_WEEK } from '../constants/schedule'
import type { Teacher } from '../types'
import PrintButton from './pdf/PrintButton'

interface Props {
  teacher: Teacher
  onClose: () => void
}

export default function TeacherScheduleModal({ teacher, onClose }: Props) {
  const grades = useScheduleStore((s) => s.grades)
  const assignments = useScheduleStore((s) => s.assignments)

  const gradeMap = new Map(grades.map((g) => [g.id, g]))
  const myAssignments = assignments.filter((a) => a.teacherId === teacher.id)

  function getCellContent(slotId: string, day: string) {
    const a = myAssignments.find((a) => a.slotId === slotId && a.day === day)
    if (!a) return null
    const grade = gradeMap.get(a.gradeId)
    return { gradeLabel: grade?.label ?? '?', subject: a.subject }
  }

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const totalHours = myAssignments.filter(
    (a) => !TIME_SLOTS.find((s) => s.id === a.slotId)?.isBreak
  ).length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: '#0c1424', borderBottom: '1px solid #1e2d42' }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${teacher.color}`} />
            <div>
              <h2 className="text-base font-bold text-white leading-tight">{teacher.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {teacher.subjects.join(' · ')} · {totalHours} hora{totalHours !== 1 ? 's' : ''}/sem.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PrintButton
              documentType="teacher"
              teacher={teacher}
              assignments={myAssignments}
              grades={grades}
            />
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Schedule table */}
        <div className="overflow-auto flex-1 p-4" style={{ background: '#f8fafc' }}>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[560px]">
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
    </div>
  )
}
