import type { DayOfWeek, TimeSlot } from '../types'

export const DAYS_OF_WEEK: { id: DayOfWeek; label: string }[] = [
  { id: 'lunes', label: 'Lunes' },
  { id: 'martes', label: 'Martes' },
  { id: 'miercoles', label: 'Miércoles' },
  { id: 'jueves', label: 'Jueves' },
  { id: 'viernes', label: 'Viernes' },
]

export const TIME_SLOTS: TimeSlot[] = [
  { id: 'slot-1', label: '1ª hora', startTime: '07:00', endTime: '07:45', isBreak: false },
  { id: 'slot-2', label: '2ª hora', startTime: '07:45', endTime: '08:30', isBreak: false },
  { id: 'slot-3', label: '3ª hora', startTime: '08:30', endTime: '09:15', isBreak: false },
  { id: 'break-1', label: 'Recreo', startTime: '09:15', endTime: '09:35', isBreak: true, breakLabel: 'Recreo' },
  { id: 'slot-4', label: '4ª hora', startTime: '09:35', endTime: '10:20', isBreak: false },
  { id: 'break-missa', label: 'Misa', startTime: '10:20', endTime: '11:05', isBreak: true, breakLabel: 'Misa' },
  { id: 'slot-5', label: '5ª hora', startTime: '11:05', endTime: '11:50', isBreak: false },
  { id: 'slot-6', label: '6ª hora', startTime: '11:50', endTime: '12:35', isBreak: false },
  { id: 'break-2', label: 'Almuerzo', startTime: '12:35', endTime: '13:05', isBreak: true, breakLabel: 'Almuerzo' },
  { id: 'slot-7', label: '7ª hora', startTime: '13:05', endTime: '13:50', isBreak: false },
  { id: 'slot-8', label: '8ª hora', startTime: '13:50', endTime: '14:25', isBreak: false },
]

export const SUBJECT_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-lime-500',
  'bg-fuchsia-500',
  'bg-sky-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-slate-500',
]

export const TEACHER_COLORS = SUBJECT_COLORS

export function getSubjectColor(subject: string): string {
  let hash = 0
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash)
  }
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length]
}

export function getTeacherColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return TEACHER_COLORS[Math.abs(hash) % TEACHER_COLORS.length]
}
