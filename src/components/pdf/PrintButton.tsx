import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import type { Assignment, Grade, Teacher } from '../../types'
import SchedulePDF from './SchedulePDF'
import TeacherSchedulePDF from './TeacherSchedulePDF'

type Props =
  | {
      documentType: 'grade'
      grade: Grade
      assignments: Assignment[]
      teachers: Teacher[]
      label?: string
    }
  | {
      documentType: 'teacher'
      teacher: Teacher
      assignments: Assignment[]
      grades: Grade[]
      label?: string
    }

export default function PrintButton(props: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      let blob: Blob
      let filename: string

      if (props.documentType === 'grade') {
        blob = await pdf(
          <SchedulePDF
            grade={props.grade}
            assignments={props.assignments}
            teachers={props.teachers}
          />
        ).toBlob()
        filename = `horario-${props.grade.label}.pdf`
      } else {
        blob = await pdf(
          <TeacherSchedulePDF
            teacher={props.teacher}
            assignments={props.assignments}
            grades={props.grades}
          />
        ).toBlob()
        filename = `horario-${props.teacher.name.replace(/\s+/g, '-')}.pdf`
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {loading ? 'Generando…' : (props.label ?? 'Descargar PDF')}
    </button>
  )
}
