import { useState, useMemo } from 'react'
import { pdf } from '@react-pdf/renderer'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useScheduleStore } from '../../store/useScheduleStore'
import { TIME_SLOTS } from '../../constants/schedule'
import {
  TeacherHoursReportPDF,
  TeacherSummaryReportPDF,
  GradeTeamReportPDF,
} from '../pdf/ReportsPDF'

type ReportTab = 'dashboard' | 'teacher-hours' | 'teacher-summary' | 'grade-team'

// Only class slots count as hours (no breaks)
const CLASS_SLOT_IDS = new Set(TIME_SLOTS.filter((s) => !s.isBreak).map((s) => s.id))

// Extract a hex-like color from Tailwind class for recharts
const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#84cc16',
  '#6366f1', '#a855f7',
]

export default function ReportsPanel() {
  const [activeTab, setActiveTab] = useState<ReportTab>('dashboard')

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      {/* ── Sub-tab bar (underline style — visually subordinate to main crimson pills) ── */}
      <div className="flex items-center gap-0 px-6 bg-slate-50 border-b border-slate-200 flex-shrink-0 overflow-x-auto">
        <TabButton id="dashboard" active={activeTab} onClick={setActiveTab} label="Resumen" icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        } />
        <TabButton id="teacher-hours" active={activeTab} onClick={setActiveTab} label="Por Profesor" icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        } />
        <TabButton id="teacher-summary" active={activeTab} onClick={setActiveTab} label="Resumen Docente" icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        } />
        <TabButton id="grade-team" active={activeTab} onClick={setActiveTab} label="Equipo Educador" icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        } />
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        {activeTab === 'dashboard' && <DashboardReport />}
        {activeTab === 'teacher-hours' && <TeacherHoursReport />}
        {activeTab === 'teacher-summary' && <TeacherSummaryReport />}
        {activeTab === 'grade-team' && <GradeTeamReport />}
      </div>
    </div>
  )
}

// ─── Tab button helper ───────────────────────────────────────────────────────

function TabButton({
  id,
  active,
  onClick,
  label,
  icon,
}: {
  id: ReportTab
  active: ReportTab
  onClick: (id: ReportTab) => void
  label: string
  icon: React.ReactNode
}) {
  const isActive = id === active
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 -mb-px ${
        isActive
          ? 'border-crimson-600 text-crimson-700'
          : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
      }`}
    >
      <span className={isActive ? 'text-crimson-600' : ''}>{icon}</span>
      {label}
    </button>
  )
}

// ─── Report 0: Dashboard — all teachers, hour load bar chart ─────────────────

function DashboardReport() {
  const teachers = useScheduleStore((s) => s.teachers)
  const assignments = useScheduleStore((s) => s.assignments)

  const data = useMemo(() => {
    const hourMap = new Map<string, number>()
    for (const a of assignments) {
      if (!CLASS_SLOT_IDS.has(a.slotId)) continue
      hourMap.set(a.teacherId, (hourMap.get(a.teacherId) ?? 0) + 1)
    }

    return teachers
      .map((t, i) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        chartColor: CHART_COLORS[i % CHART_COLORS.length],
        subjects: t.subjects,
        hours: hourMap.get(t.id) ?? 0,
      }))
      .sort((a, b) => b.hours - a.hours)
  }, [teachers, assignments])

  const totalHours = data.reduce((s, r) => s + r.hours, 0)
  const maxHours = data.length > 0 ? data[0].hours : 0
  const assigned = data.filter((t) => t.hours > 0).length

  if (teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-slate-500 font-medium">Sin datos para mostrar</p>
        <p className="text-slate-400 text-sm mt-1">Agrega profesores y asignaciones para ver el resumen.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Profesores"
          value={teachers.length}
          sub="registrados"
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Horas totales"
          value={totalHours}
          sub="asignadas / sem."
          color="emerald"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Con clases"
          value={assigned}
          sub={`de ${teachers.length} activos`}
          color="violet"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Carga máxima"
          value={maxHours}
          sub="horas / sem."
          color="amber"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Carga horaria por profesor</h2>
          <p className="text-xs text-slate-400 mt-0.5">Horas de clase asignadas por semana</p>
        </div>
        <div className="p-4" style={{ height: Math.max(260, data.length * 42 + 60) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5 text-sm min-w-[160px]">
                      <p className="font-semibold text-slate-800 mb-1">{d.name}</p>
                      <p className="text-slate-500 text-xs mb-1">{d.subjects.join(', ')}</p>
                      <p className="font-bold text-crimson-600">{d.hours} horas / sem.</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="hours" radius={[0, 6, 6, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.chartColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Teacher table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Detalle por profesor</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Profesor</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Materias</th>
              <th className="text-right px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Horas / sem.</th>
              <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Carga</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, i) => {
              const pct = maxHours > 0 ? (row.hours / maxHours) * 100 : 0
              return (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="font-medium text-slate-800">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {row.subjects.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {row.hours > 0 ? (
                      <span className="font-bold text-slate-800 tabular-nums">{row.hours}</span>
                    ) : (
                      <span className="text-slate-300 text-xs">Sin clases</span>
                    )}
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden min-w-[60px]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 tabular-nums w-8 text-right">{Math.round(pct)}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string
  value: number
  sub: string
  color: 'blue' | 'emerald' | 'violet' | 'amber'
  icon: React.ReactNode
}) {
  const colors = {
    blue: { bg: 'bg-crimson-50', text: 'text-crimson-700', icon: 'text-crimson-600', border: 'border-crimson-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500', border: 'border-emerald-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-700', icon: 'text-violet-500', border: 'border-violet-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-500', border: 'border-amber-100' },
  }
  const c = colors[color]

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-4 flex flex-col gap-2`}>
      <div className={`w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm ${c.icon}`}>
        {icon}
      </div>
      <div>
        <p className={`text-2xl font-black tabular-nums ${c.text}`}>{value}</p>
        <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5">{label}</p>
        <p className="text-xs text-slate-400 leading-tight">{sub}</p>
      </div>
    </div>
  )
}

// ─── Report 1: Total hours per teacher across all grades ─────────────────────

function TeacherHoursReport() {
  const teachers = useScheduleStore((s) => s.teachers)
  const assignments = useScheduleStore((s) => s.assignments)
  const grades = useScheduleStore((s) => s.grades)

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')
  const [downloading, setDownloading] = useState(false)

  const isAll = selectedTeacherId === '__all__'
  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId) ?? null

  const breakdown = useMemo(() => {
    if (!selectedTeacherId || isAll) return []
    const gradeMap = new Map(grades.map((g) => [g.id, g]))
    const map = new Map<string, { gradeId: string; subject: string; hours: number }>()

    for (const a of assignments) {
      if (a.teacherId !== selectedTeacherId) continue
      if (!CLASS_SLOT_IDS.has(a.slotId)) continue
      const key = `${a.gradeId}::${a.subject}`
      const existing = map.get(key)
      if (existing) {
        existing.hours++
      } else {
        map.set(key, { gradeId: a.gradeId, subject: a.subject, hours: 1 })
      }
    }

    return Array.from(map.values())
      .map((r) => ({
        gradeLabel: gradeMap.get(r.gradeId)?.label ?? r.gradeId,
        subject: r.subject,
        hours: r.hours,
      }))
      .sort((a, b) => a.gradeLabel.localeCompare(b.gradeLabel) || a.subject.localeCompare(b.subject))
  }, [selectedTeacherId, isAll, assignments, grades])

  const allTeachersData = useMemo(() => {
    if (!isAll) return []
    const gradeMap = new Map(grades.map((g) => [g.id, g]))

    return teachers.map((t) => {
      const map = new Map<string, { gradeId: string; subject: string; hours: number }>()
      for (const a of assignments) {
        if (a.teacherId !== t.id) continue
        if (!CLASS_SLOT_IDS.has(a.slotId)) continue
        const key = `${a.gradeId}::${a.subject}`
        const existing = map.get(key)
        if (existing) {
          existing.hours++
        } else {
          map.set(key, { gradeId: a.gradeId, subject: a.subject, hours: 1 })
        }
      }
      const rows = Array.from(map.values())
        .map((r) => ({
          gradeLabel: gradeMap.get(r.gradeId)?.label ?? r.gradeId,
          subject: r.subject,
          hours: r.hours,
        }))
        .sort((a, b) => a.gradeLabel.localeCompare(b.gradeLabel) || a.subject.localeCompare(b.subject))
      const total = rows.reduce((s, r) => s + r.hours, 0)
      return { teacher: t, rows, total }
    })
  }, [isAll, teachers, assignments, grades])

  const totalHours = breakdown.reduce((s, r) => s + r.hours, 0)

  async function handleDownloadPDF() {
    if (!selectedTeacher || breakdown.length === 0) return
    setDownloading(true)
    try {
      const blob = await pdf(
        <TeacherHoursReportPDF teacher={selectedTeacher} breakdown={breakdown} totalHours={totalHours} />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-horas-${selectedTeacher.name.replace(/\s+/g, '-').toLowerCase()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Horas trabajadas por profesor</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Total de horas clase asignadas a un profesor en todos los grados y secciones.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Seleccionar Profesor
        </label>
        <select
          value={selectedTeacherId}
          onChange={(e) => setSelectedTeacherId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-crimson-600"
        >
          <option value="">— Elegir profesor —</option>
          <option value="__all__">Todos</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Vista: Todos los profesores */}
      {isAll && (
        <div className="space-y-4">
          {allTeachersData.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-6 text-sm text-slate-400 text-center">
              No hay profesores registrados.
            </div>
          ) : (
            <>
              {allTeachersData.map(({ teacher, rows, total }) => (
                <div key={teacher.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${teacher.color}`} />
                    <span className="font-semibold text-slate-800 flex-1">{teacher.name}</span>
                  </div>

                  {rows.length === 0 ? (
                    <p className="px-4 py-4 text-sm text-slate-400 text-center">
                      Este profesor no tiene horas asignadas.
                    </p>
                  ) : (
                    <>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200">
                            <th className="text-left px-4 py-2">Sección</th>
                            <th className="text-left px-4 py-2">Materia</th>
                            <th className="text-right px-4 py-2">Horas / sem.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-4 py-2.5 font-semibold text-slate-700">{row.gradeLabel}</td>
                              <td className="px-4 py-2.5 text-slate-500">{row.subject}</td>
                              <td className="px-4 py-2.5 text-right tabular-nums font-medium text-slate-800">{row.hours}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-crimson-50">
                        <span className="text-sm font-bold text-crimson-800">Total</span>
                        <span className="text-sm font-bold text-crimson-800 tabular-nums">{total} horas</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Vista: Profesor individual */}
      {selectedTeacher && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${selectedTeacher.color}`} />
            <span className="font-semibold text-slate-800 flex-1">{selectedTeacher.name}</span>
            {breakdown.length > 0 && (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {downloading ? 'Generando…' : '↓ Descargar PDF'}
              </button>
            )}
          </div>

          {breakdown.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-400 text-center">
              Este profesor no tiene horas asignadas.
            </p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200">
                    <th className="text-left px-4 py-2">Sección</th>
                    <th className="text-left px-4 py-2">Materia</th>
                    <th className="text-right px-4 py-2">Horas / sem.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {breakdown.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-slate-700">{row.gradeLabel}</td>
                      <td className="px-4 py-2.5 text-slate-500">{row.subject}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium text-slate-800">{row.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-crimson-50">
                <span className="text-sm font-bold text-crimson-800">Total</span>
                <span className="text-sm font-bold text-crimson-800 tabular-nums">{totalHours} horas</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Report 2: All teachers — name, subjects, total hours ───────────────────

function TeacherSummaryReport() {
  const teachers = useScheduleStore((s) => s.teachers)
  const assignments = useScheduleStore((s) => s.assignments)

  const [search, setSearch] = useState('')
  const [downloading, setDownloading] = useState(false)

  const rows = useMemo(() => {
    const hourMap = new Map<string, number>()
    for (const a of assignments) {
      if (!CLASS_SLOT_IDS.has(a.slotId)) continue
      hourMap.set(a.teacherId, (hourMap.get(a.teacherId) ?? 0) + 1)
    }

    return teachers
      .map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        subjects: t.subjects,
        hours: hourMap.get(t.id) ?? 0,
      }))
      .sort((a, b) => b.hours - a.hours || a.name.localeCompare(b.name))
  }, [teachers, assignments])

  const filtered = search.trim()
    ? rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : rows

  async function handleDownloadPDF() {
    if (rows.length === 0) return
    setDownloading(true)
    try {
      const blob = await pdf(
        <TeacherSummaryReportPDF rows={rows} />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'reporte-resumen-docentes.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Resumen de docentes</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Nombre, materias que imparte y total de horas semanales de cada profesor.
          </p>
        </div>
        {rows.length > 0 && (
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {downloading ? 'Generando…' : '↓ Descargar PDF'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar profesor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-400 text-center">No hay resultados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200">
                <th className="text-left px-4 py-2.5">Profesor</th>
                <th className="text-left px-4 py-2.5">Materias</th>
                <th className="text-right px-4 py-2.5">Horas / sem.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${row.color}`} />
                      <span className="font-medium text-slate-800">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {row.subjects.map((s) => (
                        <span key={s} className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-800">
                    {row.hours > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        {row.hours}
                        <span className="text-xs font-normal text-slate-400">h</span>
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Report 4: Teaching team per grade section ───────────────────────────────

function GradeTeamReport() {
  const grades = useScheduleStore((s) => s.grades)
  const teachers = useScheduleStore((s) => s.teachers)
  const assignments = useScheduleStore((s) => s.assignments)

  const [selectedGradeId, setSelectedGradeId] = useState<string>('')
  const [downloading, setDownloading] = useState(false)

  const selectedGrade = grades.find((g) => g.id === selectedGradeId) ?? null

  const team = useMemo(() => {
    if (!selectedGradeId) return []
    const teacherMap = new Map(teachers.map((t) => [t.id, t]))
    const map = new Map<string, Map<string, number>>()

    for (const a of assignments) {
      if (a.gradeId !== selectedGradeId) continue
      if (!CLASS_SLOT_IDS.has(a.slotId)) continue
      if (!map.has(a.teacherId)) map.set(a.teacherId, new Map())
      const subMap = map.get(a.teacherId)!
      subMap.set(a.subject, (subMap.get(a.subject) ?? 0) + 1)
    }

    return Array.from(map.entries())
      .map(([teacherId, subMap]) => {
        const teacher = teacherMap.get(teacherId)
        const subjects = Array.from(subMap.entries())
          .map(([subject, hours]) => ({ subject, hours }))
          .sort((a, b) => a.subject.localeCompare(b.subject))
        const totalHours = subjects.reduce((s, r) => s + r.hours, 0)
        return { teacher, subjects, totalHours }
      })
      .filter((r) => r.teacher != null)
      .sort((a, b) => b.totalHours - a.totalHours || a.teacher!.name.localeCompare(b.teacher!.name))
  }, [selectedGradeId, assignments, teachers])

  const grandTotal = team.reduce((s, r) => s + r.totalHours, 0)

  async function handleDownloadPDF() {
    if (!selectedGrade || team.length === 0) return
    setDownloading(true)
    try {
      const teamForPDF = team.filter((r) => r.teacher != null) as {
        teacher: NonNullable<(typeof team)[number]['teacher']>
        subjects: { subject: string; hours: number }[]
        totalHours: number
      }[]
      const blob = await pdf(
        <GradeTeamReportPDF grade={selectedGrade} team={teamForPDF} />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-equipo-${selectedGrade.label.replace(/\s+/g, '-').toLowerCase()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Equipo educador por sección</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Todos los docentes asignados a una sección, con sus materias y horas semanales.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Seleccionar Sección
        </label>
        <select
          value={selectedGradeId}
          onChange={(e) => setSelectedGradeId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-crimson-600"
        >
          <option value="">— Elegir sección —</option>
          {grades.map((g) => (
            <option key={g.id} value={g.id}>{g.label}</option>
          ))}
        </select>
      </div>

      {selectedGrade && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="font-semibold text-slate-800">Sección {selectedGrade.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">{team.length} docente{team.length !== 1 ? 's' : ''}</span>
              {team.length > 0 && (
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {downloading ? 'Generando…' : '↓ Descargar PDF'}
                </button>
              )}
            </div>
          </div>

          {team.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-400 text-center">
              Esta sección no tiene docentes asignados.
            </p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200">
                    <th className="text-left px-4 py-2">Docente</th>
                    <th className="text-left px-4 py-2">Materia</th>
                    <th className="text-right px-4 py-2">Horas / sem.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {team.map(({ teacher, subjects, totalHours }) =>
                    subjects.map((s, si) => (
                      <tr key={`${teacher!.id}-${s.subject}`} className="hover:bg-slate-50/60 transition-colors">
                        {si === 0 && (
                          <td className="px-4 py-2.5 align-top" rowSpan={subjects.length}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${teacher!.color}`} />
                              <div>
                                <div className="font-semibold text-slate-800">{teacher!.name}</div>
                                {subjects.length > 1 && (
                                  <div className="text-xs text-slate-400 tabular-nums">{totalHours} h total</div>
                                )}
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-2.5 text-slate-500">{s.subject}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-medium text-slate-800">{s.hours}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-crimson-50">
                <span className="text-sm font-bold text-crimson-800">Total horas sección</span>
                <span className="text-sm font-bold text-crimson-800 tabular-nums">{grandTotal} horas</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
