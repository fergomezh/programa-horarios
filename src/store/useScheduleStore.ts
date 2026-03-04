import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Assignment, DayOfWeek, Grade, Teacher } from '../types'
import { TEACHER_COLORS } from '../constants/schedule'

interface ScheduleState {
  teachers: Teacher[]
  grades: Grade[]
  assignments: Assignment[]
  activeGradeId: string | null

  // Teacher actions
  addTeacher: (name: string, subjects: string[]) => void
  updateTeacher: (id: string, name: string, subjects: string[]) => void
  removeTeacher: (id: string) => void

  // Grade actions
  addGrade: (name: string, section: string) => void
  updateGrade: (id: string, name: string, section: string) => void
  removeGrade: (id: string) => void
  setActiveGradeId: (id: string | null) => void

  // Assignment actions
  assignTeacher: (gradeId: string, slotId: string, day: DayOfWeek, teacherId: string, subject: string) => void
  removeAssignment: (gradeId: string, slotId: string, day: DayOfWeek) => void
  moveAssignment: (
    sourceGradeId: string,
    sourceSlotId: string,
    sourceDay: DayOfWeek,
    targetGradeId: string,
    targetSlotId: string,
    targetDay: DayOfWeek,
    teacherId: string,
  ) => void

  loadSampleData: () => void
}

let colorIndex = 0
function nextColor(): string {
  const color = TEACHER_COLORS[colorIndex % TEACHER_COLORS.length]
  colorIndex++
  return color
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}

const SAMPLE_TEACHERS: Omit<Teacher, 'id'>[] = [
  { name: 'Marta López', subjects: ['Matemáticas', 'Estadística'], color: TEACHER_COLORS[0] },
  { name: 'Carlos Rivas', subjects: ['Lenguaje', 'Literatura'], color: TEACHER_COLORS[1] },
  { name: 'Ana García', subjects: ['Ciencias', 'Biología', 'Química'], color: TEACHER_COLORS[2] },
  { name: 'Pedro Molina', subjects: ['Historia', 'Ciencias Sociales'], color: TEACHER_COLORS[3] },
  { name: 'Lucía Torres', subjects: ['Inglés'], color: TEACHER_COLORS[4] },
]

const SAMPLE_GRADES: Omit<Grade, 'id'>[] = [
  { name: '1°', section: 'A', label: '1°A' },
  { name: '1°', section: 'B', label: '1°B' },
  { name: '2°', section: 'A', label: '2°A' },
  { name: '3°', section: 'A', label: '3°A' },
  { name: '4°', section: 'A', label: '4°A' },
]

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      teachers: [],
      grades: [],
      assignments: [],
      activeGradeId: null,

      addTeacher(name, subjects) {
        const teacher: Teacher = {
          id: uid(),
          name,
          subjects,
          color: nextColor(),
        }
        set((s) => ({ teachers: [...s.teachers, teacher] }))
      },

      updateTeacher(id, name, subjects) {
        set((s) => ({
          teachers: s.teachers.map((t) => (t.id === id ? { ...t, name, subjects } : t)),
        }))
      },

      removeTeacher(id) {
        set((s) => ({
          teachers: s.teachers.filter((t) => t.id !== id),
          assignments: s.assignments.filter((a) => a.teacherId !== id),
        }))
      },

      addGrade(name, section) {
        const grade: Grade = {
          id: uid(),
          name,
          section,
          label: `${name}${section}`,
        }
        set((s) => {
          const grades = [...s.grades, grade]
          return {
            grades,
            activeGradeId: s.activeGradeId ?? grade.id,
          }
        })
      },

      updateGrade(id, name, section) {
        set((s) => ({
          grades: s.grades.map((g) =>
            g.id === id ? { ...g, name, section, label: `${name}${section}` } : g,
          ),
        }))
      },

      removeGrade(id) {
        set((s) => {
          const grades = s.grades.filter((g) => g.id !== id)
          let activeGradeId = s.activeGradeId
          if (activeGradeId === id) {
            activeGradeId = grades[0]?.id ?? null
          }
          return {
            grades,
            assignments: s.assignments.filter((a) => a.gradeId !== id),
            activeGradeId,
          }
        })
      },

      setActiveGradeId(id) {
        set({ activeGradeId: id })
      },

      assignTeacher(gradeId, slotId, day, teacherId, subject) {
        set((s) => {
          const others = s.assignments.filter(
            (a) => !(a.gradeId === gradeId && a.slotId === slotId && a.day === day),
          )
          const newAssignment: Assignment = {
            id: uid(),
            gradeId,
            slotId,
            day,
            teacherId,
            subject,
          }
          return { assignments: [...others, newAssignment] }
        })
      },

      removeAssignment(gradeId, slotId, day) {
        set((s) => ({
          assignments: s.assignments.filter(
            (a) => !(a.gradeId === gradeId && a.slotId === slotId && a.day === day),
          ),
        }))
      },

      moveAssignment(sourceGradeId, sourceSlotId, sourceDay, targetGradeId, targetSlotId, targetDay, teacherId) {
        if (
          sourceGradeId === targetGradeId &&
          sourceSlotId === targetSlotId &&
          sourceDay === targetDay
        ) {
          return
        }
        set((s) => {
          // Preserve the subject from the source assignment
          const source = s.assignments.find(
            (a) => a.gradeId === sourceGradeId && a.slotId === sourceSlotId && a.day === sourceDay,
          )
          const subject = source?.subject ?? ''

          const filtered = s.assignments.filter(
            (a) =>
              !(a.gradeId === sourceGradeId && a.slotId === sourceSlotId && a.day === sourceDay) &&
              !(a.gradeId === targetGradeId && a.slotId === targetSlotId && a.day === targetDay),
          )
          const newAssignment: Assignment = {
            id: uid(),
            gradeId: targetGradeId,
            slotId: targetSlotId,
            day: targetDay,
            teacherId,
            subject,
          }
          return { assignments: [...filtered, newAssignment] }
        })
      },

      loadSampleData() {
        const existingCount = get().teachers.length
        const teachers: Teacher[] = SAMPLE_TEACHERS.map((t, i) => ({
          ...t,
          id: uid(),
          color: TEACHER_COLORS[(existingCount + i) % TEACHER_COLORS.length],
        }))
        const grades: Grade[] = SAMPLE_GRADES.map((g) => ({ ...g, id: uid() }))
        colorIndex = (existingCount + teachers.length) % TEACHER_COLORS.length
        set((s) => ({
          teachers: [...s.teachers, ...teachers],
          grades: [...s.grades, ...grades],
          activeGradeId: s.activeGradeId ?? grades[0]?.id ?? null,
        }))
      },
    }),
    {
      name: 'lamatepec-horarios-v2',
      partialize: (state) => ({
        teachers: state.teachers,
        grades: state.grades,
        assignments: state.assignments,
      }),
    },
  ),
)
