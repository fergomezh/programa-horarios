import type { Conflict, Grade } from '../../types'
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../constants/schedule'
import { useScheduleStore } from '../../store/useScheduleStore'
import ScheduleCell from './ScheduleCell'

interface Props {
  grade: Grade
  conflicts: Map<string, Conflict>
}

export default function ScheduleGrid({ grade, conflicts }: Props) {
  const teachers = useScheduleStore((s) => s.teachers)
  const assignments = useScheduleStore((s) => s.assignments)

  const teacherMap = new Map(teachers.map((t) => [t.id, t]))

  return (
    <div className="overflow-auto h-full">
      <table className="border-collapse text-xs" style={{ minWidth: '100%' }}>
        <thead>
          <tr className="sticky top-0 z-10">
            <th
              className="border border-slate-200 px-3 py-2.5 text-left font-semibold whitespace-nowrap"
              style={{
                background: '#1e293b',
                color: '#94a3b8',
                width: 112,
                minWidth: 112,
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Hora
            </th>
            {DAYS_OF_WEEK.map((d) => (
              <th
                key={d.id}
                className="border border-slate-600/30 px-2 py-2.5 text-center font-semibold"
                style={{
                  background: '#1e293b',
                  color: '#e2e8f0',
                  minWidth: 100,
                  fontSize: 12,
                  letterSpacing: '0.03em',
                }}
              >
                {d.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((slot) => {
            if (slot.isBreak) {
              return (
                <tr key={slot.id}>
                  <td
                    colSpan={6}
                    className="border border-slate-200 text-center font-medium"
                    style={{
                      background: '#f8fafc',
                      color: '#64748b',
                      padding: '8px 12px',
                      fontSize: 11,
                      letterSpacing: '0.04em',
                      borderTop: '2px solid #e2e8f0',
                      borderBottom: '2px solid #e2e8f0',
                    }}
                  >
                    <span className="font-time">{slot.startTime}–{slot.endTime}</span>
                    {' · '}
                    <span className="font-semibold">{slot.breakLabel}</span>
                  </td>
                </tr>
              )
            }

            return (
              <tr key={slot.id}>
                <td
                  className="border border-slate-200 px-2 py-1.5 whitespace-nowrap"
                  style={{ background: '#f8fafc', verticalAlign: 'middle', width: 90, minWidth: 90 }}
                >
                  <div className="font-semibold text-slate-600" style={{ fontSize: 11, letterSpacing: '0.01em' }}>
                    {slot.label}
                  </div>
                  <div className="text-slate-400 font-time mt-0.5" style={{ fontSize: 10 }}>
                    {slot.startTime}–{slot.endTime}
                  </div>
                </td>

                {DAYS_OF_WEEK.map((d) => {
                  const assignment = assignments.find(
                    (a) => a.gradeId === grade.id && a.slotId === slot.id && a.day === d.id,
                  )
                  const teacher = assignment ? (teacherMap.get(assignment.teacherId) ?? null) : null
                  const subject = assignment?.subject ?? null

                  return (
                    <ScheduleCell
                      key={d.id}
                      gradeId={grade.id}
                      slotId={slot.id}
                      day={d.id}
                      teacher={teacher}
                      subject={subject}
                      conflicts={conflicts}
                    />
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
