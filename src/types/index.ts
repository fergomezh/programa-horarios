export type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes'

export interface Teacher {
  id: string
  name: string
  subjects: string[]
  color: string
}

export interface Grade {
  id: string
  name: string
  section: string
  label: string // e.g. "1°A"
}

export interface Assignment {
  id: string
  gradeId: string
  slotId: string
  day: DayOfWeek
  teacherId: string
  subject: string // which subject this teacher is teaching in this specific slot
}

export interface TimeSlot {
  id: string
  label: string
  startTime: string
  endTime: string
  isBreak: boolean
  breakLabel?: string
}

// DnD Payloads
export interface DraggableTeacherData {
  type: 'teacher'
  teacherId: string
  sourceGradeId: string | null
  sourceSlotId: string | null
  sourceDay: DayOfWeek | null
}

export interface DroppableCellData {
  type: 'cell'
  gradeId: string
  slotId: string
  day: DayOfWeek
}

export interface Conflict {
  teacherId: string
  slotId: string
  day: DayOfWeek
  gradeIds: string[]
}
