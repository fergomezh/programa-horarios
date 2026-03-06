import { useState, useMemo } from 'react'
import { useScheduleStore } from '../../store/useScheduleStore'
import { useConflicts } from '../../hooks/useConflicts'
import type { Teacher } from '../../types'
import type { MainTab } from '../layout/AppLayout'
import TeacherCard from './TeacherCard'
import AddTeacherModal from './AddTeacherModal'
import ConflictPanel from './ConflictPanel'

interface Props {
  activeTab: MainTab
  onTeacherClick: (teacher: Teacher) => void
}

export default function TeacherPanel({ activeTab, onTeacherClick }: Props) {
  const teachers = useScheduleStore((s) => s.teachers)
  const conflicts = useConflicts()
  const [showModal, setShowModal] = useState(false)
  const [subjectFilter, setSubjectFilter] = useState<string>('')

  const conflictedTeacherIds = new Set<string>()
  for (const conflict of conflicts.values()) {
    conflictedTeacherIds.add(conflict.teacherId)
  }

  const allSubjects = useMemo(() => {
    const subjects = new Set<string>()
    for (const teacher of teachers) {
      for (const subject of teacher.subjects) {
        subjects.add(subject)
      }
    }
    return Array.from(subjects).sort()
  }, [teachers])

  const filteredTeachers = useMemo(() => {
    if (!subjectFilter) return teachers
    return teachers.filter((t) => t.subjects.includes(subjectFilter))
  }, [teachers, subjectFilter])

  const isDraggable = activeTab === 'schedule'

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Section header */}
      <div className="flex flex-col gap-2 px-3 py-2.5 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Profesores</span>
            {filteredTeachers.length > 0 && (
              <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full font-time">
                {subjectFilter ? `${filteredTeachers.length}/${teachers.length}` : teachers.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Agregar
          </button>
        </div>
        {allSubjects.length > 0 && (
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full text-xs bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todas las materias</option>
            {allSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Teacher list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-1.5">
        {filteredTeachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-8 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {subjectFilter
                ? `No hay profesores que impartan "${subjectFilter}".`
                : 'Sin profesores registrados.'}
              <br />{!subjectFilter && 'Agrega uno o carga datos de ejemplo.'}
            </p>
          </div>
        ) : (
          filteredTeachers.map((t) => (
            <TeacherCard
              key={t.id}
              teacher={t}
              hasConflict={conflictedTeacherIds.has(t.id)}
              draggable={isDraggable}
              onClick={() => onTeacherClick(t)}
            />
          ))
        )}
      </div>

      {/* Conflict panel — always visible at bottom */}
      <ConflictPanel />

      {showModal && <AddTeacherModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
