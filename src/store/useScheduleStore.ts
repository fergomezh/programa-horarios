import { create } from 'zustand'
import type { Assignment, DayOfWeek, Grade, Teacher } from '../types'
import { TEACHER_COLORS } from '../constants/schedule'
import { supabase } from '../lib/supabase'

interface ScheduleState {
  teachers: Teacher[]
  grades: Grade[]
  assignments: Assignment[]
  activeGradeId: string | null
  storeError: string | null

  // Init
  initStore: () => Promise<void>

  // Teacher actions
  addTeacher: (name: string, subjects: string[]) => Promise<void>
  updateTeacher: (id: string, name: string, subjects: string[]) => Promise<void>
  removeTeacher: (id: string) => Promise<void>

  // Grade actions
  addGrade: (name: string, section: string) => Promise<void>
  updateGrade: (id: string, name: string, section: string) => Promise<void>
  removeGrade: (id: string) => Promise<void>
  setActiveGradeId: (id: string | null) => void

  // Assignment actions
  assignTeacher: (gradeId: string, slotId: string, day: DayOfWeek, teacherId: string, subject: string) => Promise<void>
  removeAssignment: (gradeId: string, slotId: string, day: DayOfWeek) => Promise<void>
  moveAssignment: (
    sourceGradeId: string,
    sourceSlotId: string,
    sourceDay: DayOfWeek,
    targetGradeId: string,
    targetSlotId: string,
    targetDay: DayOfWeek,
    teacherId: string,
  ) => Promise<void>

  loadSampleData: () => Promise<void>
}

let colorIndex = 0
function nextColor(): string {
  const color = TEACHER_COLORS[colorIndex % TEACHER_COLORS.length]
  colorIndex++
  return color
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

// Map DB snake_case rows → camelCase types
function rowToTeacher(row: Record<string, unknown>): Teacher {
  return {
    id: row.id as string,
    name: row.name as string,
    subjects: row.subjects as string[],
    color: row.color as string,
    email: (row.email as string | null) ?? null,
  }
}

function rowToGrade(row: Record<string, unknown>): Grade {
  return {
    id: row.id as string,
    name: row.name as string,
    section: row.section as string,
    label: row.label as string,
  }
}

function rowToAssignment(row: Record<string, unknown>): Assignment {
  return {
    id: row.id as string,
    gradeId: row.grade_id as string,
    slotId: row.slot_id as string,
    day: row.day as DayOfWeek,
    teacherId: row.teacher_id as string,
    subject: row.subject as string,
  }
}

export const useScheduleStore = create<ScheduleState>()((set, get) => ({
  teachers: [],
  grades: [],
  assignments: [],
  activeGradeId: null,
  storeError: null,

  async initStore() {
    const [teachersRes, gradesRes, assignmentsRes] = await Promise.all([
      supabase.from('teachers').select('*').order('name'),
      supabase.from('grades').select('*').order('label'),
      supabase.from('assignments').select('*'),
    ])

    if (teachersRes.error || gradesRes.error || assignmentsRes.error) {
      const msg = teachersRes.error?.message ?? gradesRes.error?.message ?? assignmentsRes.error?.message ?? 'Error loading data'
      set({ storeError: msg })
      return
    }

    const teachers = (teachersRes.data ?? []).map(rowToTeacher)
    const grades = (gradesRes.data ?? []).map(rowToGrade)
    const assignments = (assignmentsRes.data ?? []).map(rowToAssignment)

    // Sync colorIndex past the last used color
    colorIndex = teachers.length % TEACHER_COLORS.length

    set({
      teachers,
      grades,
      assignments,
      activeGradeId: grades[0]?.id ?? null,
      storeError: null,
    })
  },

  async addTeacher(name, subjects) {
    const color = nextColor()
    const { data, error } = await supabase
      .from('teachers')
      .insert({ name, subjects, color })
      .select()
      .single()
    if (error || !data) { set({ storeError: error?.message ?? 'Error adding teacher' }); return }
    set((s) => ({ teachers: [...s.teachers, rowToTeacher(data)] }))
  },

  async updateTeacher(id, name, subjects) {
    const { error } = await supabase
      .from('teachers')
      .update({ name, subjects })
      .eq('id', id)
    if (error) { set({ storeError: error.message }); return }
    set((s) => ({
      teachers: s.teachers.map((t) => (t.id === id ? { ...t, name, subjects } : t)),
    }))
  },

  async removeTeacher(id) {
    const { error } = await supabase.from('teachers').delete().eq('id', id)
    if (error) { set({ storeError: error.message }); return }
    set((s) => ({
      teachers: s.teachers.filter((t) => t.id !== id),
      assignments: s.assignments.filter((a) => a.teacherId !== id),
    }))
  },

  async addGrade(name, section) {
    const label = `${name}${section}`
    const { data, error } = await supabase
      .from('grades')
      .insert({ name, section, label })
      .select()
      .single()
    if (error || !data) { set({ storeError: error?.message ?? 'Error adding grade' }); return }
    const grade = rowToGrade(data)
    set((s) => ({
      grades: [...s.grades, grade],
      activeGradeId: s.activeGradeId ?? grade.id,
    }))
  },

  async updateGrade(id, name, section) {
    const label = `${name}${section}`
    const { error } = await supabase
      .from('grades')
      .update({ name, section, label })
      .eq('id', id)
    if (error) { set({ storeError: error.message }); return }
    set((s) => ({
      grades: s.grades.map((g) => (g.id === id ? { ...g, name, section, label } : g)),
    }))
  },

  async removeGrade(id) {
    const { error } = await supabase.from('grades').delete().eq('id', id)
    if (error) { set({ storeError: error.message }); return }
    set((s) => {
      const grades = s.grades.filter((g) => g.id !== id)
      const activeGradeId = s.activeGradeId === id ? (grades[0]?.id ?? null) : s.activeGradeId
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

  async assignTeacher(gradeId, slotId, day, teacherId, subject) {
    // Upsert by unique constraint (grade_id, slot_id, day)
    const { data, error } = await supabase
      .from('assignments')
      .upsert({ grade_id: gradeId, slot_id: slotId, day, teacher_id: teacherId, subject }, {
        onConflict: 'grade_id,slot_id,day',
      })
      .select()
      .single()
    if (error || !data) { set({ storeError: error?.message ?? 'Error assigning teacher' }); return }
    const newAssignment = rowToAssignment(data)
    set((s) => {
      const others = s.assignments.filter(
        (a) => !(a.gradeId === gradeId && a.slotId === slotId && a.day === day),
      )
      return { assignments: [...others, newAssignment] }
    })
  },

  async removeAssignment(gradeId, slotId, day) {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('grade_id', gradeId)
      .eq('slot_id', slotId)
      .eq('day', day)
    if (error) { set({ storeError: error.message }); return }
    set((s) => ({
      assignments: s.assignments.filter(
        (a) => !(a.gradeId === gradeId && a.slotId === slotId && a.day === day),
      ),
    }))
  },

  async moveAssignment(sourceGradeId, sourceSlotId, sourceDay, targetGradeId, targetSlotId, targetDay, teacherId) {
    if (sourceGradeId === targetGradeId && sourceSlotId === targetSlotId && sourceDay === targetDay) return

    const source = get().assignments.find(
      (a) => a.gradeId === sourceGradeId && a.slotId === sourceSlotId && a.day === sourceDay,
    )
    const subject = source?.subject ?? ''

    // Delete source, upsert target
    const [delRes, upsertRes] = await Promise.all([
      supabase
        .from('assignments')
        .delete()
        .eq('grade_id', sourceGradeId)
        .eq('slot_id', sourceSlotId)
        .eq('day', sourceDay),
      supabase
        .from('assignments')
        .upsert({ grade_id: targetGradeId, slot_id: targetSlotId, day: targetDay, teacher_id: teacherId, subject }, {
          onConflict: 'grade_id,slot_id,day',
        })
        .select()
        .single(),
    ])

    if (delRes.error || upsertRes.error) {
      set({ storeError: delRes.error?.message ?? upsertRes.error?.message ?? 'Error moving assignment' })
      return
    }

    const newAssignment = rowToAssignment(upsertRes.data)
    set((s) => {
      const filtered = s.assignments.filter(
        (a) =>
          !(a.gradeId === sourceGradeId && a.slotId === sourceSlotId && a.day === sourceDay) &&
          !(a.gradeId === targetGradeId && a.slotId === targetSlotId && a.day === targetDay),
      )
      return { assignments: [...filtered, newAssignment] }
    })
  },

  async loadSampleData() {
    const existingCount = get().teachers.length

    // Insert teachers
    const teacherRows = SAMPLE_TEACHERS.map((t, i) => ({
      name: t.name,
      subjects: t.subjects,
      color: TEACHER_COLORS[(existingCount + i) % TEACHER_COLORS.length],
    }))
    const { data: tData, error: tErr } = await supabase
      .from('teachers')
      .insert(teacherRows)
      .select()
    if (tErr || !tData) { set({ storeError: tErr?.message ?? 'Error loading sample teachers' }); return }

    const gradeRows = SAMPLE_GRADES.map((g) => ({ name: g.name, section: g.section, label: g.label }))
    const { data: gData, error: gErr } = await supabase
      .from('grades')
      .insert(gradeRows)
      .select()
    if (gErr || !gData) { set({ storeError: gErr?.message ?? 'Error loading sample grades' }); return }

    const teachers = tData.map(rowToTeacher)
    const grades = gData.map(rowToGrade)
    colorIndex = (existingCount + teachers.length) % TEACHER_COLORS.length

    set((s) => ({
      teachers: [...s.teachers, ...teachers],
      grades: [...s.grades, ...grades],
      activeGradeId: s.activeGradeId ?? grades[0]?.id ?? null,
    }))
  },
}))
