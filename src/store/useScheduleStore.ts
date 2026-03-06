import { create } from 'zustand'
import type { Assignment, DayOfWeek, Grade, Teacher } from '../types'
import { getTeacherColor } from '../constants/schedule'
import { supabase } from '../lib/supabase'

interface ScheduleState {
  teachers: Teacher[]
  grades: Grade[]
  assignments: Assignment[]
  activeGradeId: string | null
  storeError: string | null
  isLoading: boolean
  subjectLimits: Record<string, Record<string, number>>

  // Init
  initStore: () => Promise<void>
  setSubjectLimit: (gradeId: string, subject: string, limit: number | null) => Promise<void>

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



const SAMPLE_TEACHERS: Omit<Teacher, 'id'>[] = [
  { name: 'Carlos Martínez',  subjects: ['Matemáticas', 'Física'],               color: getTeacherColor('Carlos Martínez') },
  { name: 'Ana López',        subjects: ['Lenguaje y Literatura'],                color: getTeacherColor('Ana López') },
  { name: 'María García',     subjects: ['Inglés'],                               color: getTeacherColor('María García') },
  { name: 'José Hernández',   subjects: ['Ciencias Naturales', 'Biología'],       color: getTeacherColor('José Hernández') },
  { name: 'Rosa Pérez',       subjects: ['Estudios Sociales', 'Historia'],        color: getTeacherColor('Rosa Pérez') },
  { name: 'Miguel Torres',    subjects: ['Educación Física'],                     color: getTeacherColor('Miguel Torres') },
  { name: 'Carmen Flores',    subjects: ['Arte y Cultura', 'Música'],             color: getTeacherColor('Carmen Flores') },
  { name: 'Luis Rodríguez',   subjects: ['Informática', 'Tecnología'],            color: getTeacherColor('Luis Rodríguez') },
  { name: 'Diana Morales',    subjects: ['Química', 'Ciencias Naturales'],        color: getTeacherColor('Diana Morales') },
  { name: 'Roberto Castillo', subjects: ['Religión', 'Moral y Ética'],            color: getTeacherColor('Roberto Castillo') },
]

const SAMPLE_GRADES: Omit<Grade, 'id'>[] = Array.from({ length: 12 }, (_, i) => {
  const name = `${i + 1}°`
  return [
    { name, section: 'A', label: `${name}A` },
    { name, section: 'B', label: `${name}B` },
  ]
}).flat()

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
  isLoading: true,
  subjectLimits: {},

  async setSubjectLimit(gradeId, subject, limit) {
    if (limit === null) {
      const { error } = await supabase
        .from('subject_limits')
        .delete()
        .eq('grade_id', gradeId)
        .eq('subject', subject)
      if (error) { set({ storeError: error.message }); return }
    } else {
      const { error } = await supabase
        .from('subject_limits')
        .upsert({ grade_id: gradeId, subject, limit_hours: limit }, { onConflict: 'grade_id,subject' })
      if (error) { set({ storeError: error.message }); return }
    }
    set((s) => {
      const gradeMap = { ...(s.subjectLimits[gradeId] ?? {}) }
      if (limit === null) delete gradeMap[subject]
      else gradeMap[subject] = limit
      return { subjectLimits: { ...s.subjectLimits, [gradeId]: gradeMap } }
    })
  },

  async initStore() {
    set({ isLoading: true })
    const [teachersRes, gradesRes, assignmentsRes, limitsRes] = await Promise.all([
      supabase.from('teachers').select('*').order('name'),
      supabase.from('grades').select('*').order('label'),
      supabase.from('assignments').select('*'),
      supabase.from('subject_limits').select('*'),
    ])

    if (teachersRes.error || gradesRes.error || assignmentsRes.error || limitsRes.error) {
      const msg = teachersRes.error?.message ?? gradesRes.error?.message ?? assignmentsRes.error?.message ?? limitsRes.error?.message ?? 'Error loading data'
      set({ storeError: msg, isLoading: false })
      return
    }

    const teachers = (teachersRes.data ?? []).map(rowToTeacher)
    const grades = (gradesRes.data ?? []).map(rowToGrade)
    const assignments = (assignmentsRes.data ?? []).map(rowToAssignment)

    // Ensure each teacher has a unique color based on their name
    for (const teacher of teachers) {
      const uniqueColor = getTeacherColor(teacher.name)
      if (teacher.color !== uniqueColor) {
        await supabase
          .from('teachers')
          .update({ color: uniqueColor })
          .eq('id', teacher.id)
        teacher.color = uniqueColor
      }
    }

    // Build subjectLimits map from flat rows
    const subjectLimits: Record<string, Record<string, number>> = {}
    for (const row of limitsRes.data ?? []) {
      const gradeId = row.grade_id as string
      const subject = row.subject as string
      const limitHours = row.limit_hours as number
      if (!subjectLimits[gradeId]) subjectLimits[gradeId] = {}
      subjectLimits[gradeId][subject] = limitHours
    }

    set({
      teachers,
      grades,
      assignments,
      subjectLimits,
      activeGradeId: grades[0]?.id ?? null,
      storeError: null,
      isLoading: false,
    })
  },

  async addTeacher(name, subjects) {
    const color = getTeacherColor(name)
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
    // If the teacher has an auth account, delete it first
    const teacher = get().teachers.find((t) => t.id === id)
    if (teacher?.email) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        await supabase.functions.invoke('delete-teacher-account', {
          body: { teacherId: id },
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
      }
    }

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
    // Guard: never insert if data already exists
    if (get().teachers.length > 0 || get().grades.length > 0) return

    // Insert teachers
    const teacherRows = SAMPLE_TEACHERS.map((t) => ({
      name: t.name,
      subjects: t.subjects,
      color: getTeacherColor(t.name),
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

    set((s) => ({
      teachers: [...s.teachers, ...teachers],
      grades: [...s.grades, ...grades],
      activeGradeId: s.activeGradeId ?? grades[0]?.id ?? null,
    }))
  },
}))
