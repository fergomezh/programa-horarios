import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Grade, Teacher } from '../../types'

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 8, fontFamily: 'Helvetica' },
  header: { marginBottom: 16 },
  title: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 9, color: '#64748b', marginTop: 2 },
  table: { width: '100%' },
  thead: { flexDirection: 'row', backgroundColor: '#0c1424' },
  th: { flex: 1, padding: 5, color: '#94a3b8', fontSize: 7, fontWeight: 'bold' },
  thRight: { flex: 1, padding: 5, color: '#94a3b8', fontSize: 7, fontWeight: 'bold', textAlign: 'right' },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  trAlt: { flexDirection: 'row', backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  trTotal: { flexDirection: 'row', backgroundColor: '#eff6ff', borderTopWidth: 2, borderTopColor: '#bfdbfe' },
  td: { flex: 1, padding: 5, color: '#334155' },
  tdRight: { flex: 1, padding: 5, color: '#1e3a5f', fontWeight: 'bold', textAlign: 'right' },
  tdBold: { flex: 1, padding: 5, color: '#1e293b', fontWeight: 'bold' },
  tdMuted: { flex: 1, padding: 5, color: '#64748b' },
  statCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#f8fafc',
  },
  statLabel: { fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  statValue: { fontSize: 36, fontWeight: 'bold', color: '#1d4ed8', marginTop: 6 },
  statUnit: { fontSize: 10, color: '#64748b', marginTop: 4 },
})

// ─── Report 1: Teacher hours ──────────────────────────────────────────────────

interface TeacherHoursProps {
  teacher: Teacher
  breakdown: { gradeLabel: string; subject: string; hours: number }[]
  totalHours: number
}

export function TeacherHoursReportPDF({ teacher, breakdown, totalHours }: TeacherHoursProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Colegio Lamatepec — Horas por Profesor</Text>
          <Text style={styles.subtitle}>{teacher.name} · Año lectivo 2026</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.thead}>
            <View style={styles.th}><Text>Sección</Text></View>
            <View style={styles.th}><Text>Materia</Text></View>
            <View style={styles.thRight}><Text>Horas / sem.</Text></View>
          </View>
          {breakdown.map((row, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tr : styles.trAlt}>
              <View style={styles.tdBold}><Text>{row.gradeLabel}</Text></View>
              <View style={styles.tdMuted}><Text>{row.subject}</Text></View>
              <View style={styles.tdRight}><Text>{row.hours}</Text></View>
            </View>
          ))}
          <View style={styles.trTotal}>
            <View style={styles.tdBold}><Text>Total</Text></View>
            <View style={styles.td}><Text> </Text></View>
            <View style={styles.tdRight}><Text>{totalHours} horas</Text></View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

// ─── Report 2: Teacher summary ────────────────────────────────────────────────

interface TeacherSummaryRow {
  name: string
  subjects: string[]
  hours: number
}

interface TeacherSummaryProps {
  rows: TeacherSummaryRow[]
}

export function TeacherSummaryReportPDF({ rows }: TeacherSummaryProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Colegio Lamatepec — Resumen Docente</Text>
          <Text style={styles.subtitle}>Todos los profesores · Año lectivo 2026</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.thead}>
            <View style={{ ...styles.th, flex: 1.5 }}><Text>Profesor</Text></View>
            <View style={{ ...styles.th, flex: 2 }}><Text>Materias</Text></View>
            <View style={styles.thRight}><Text>Horas / sem.</Text></View>
          </View>
          {rows.map((row, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tr : styles.trAlt}>
              <View style={{ ...styles.tdBold, flex: 1.5 }}><Text>{row.name}</Text></View>
              <View style={{ ...styles.tdMuted, flex: 2 }}><Text>{row.subjects.join(', ')}</Text></View>
              <View style={styles.tdRight}><Text>{row.hours > 0 ? `${row.hours} h` : '—'}</Text></View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}

// ─── Report 3: Subject hours ──────────────────────────────────────────────────

interface SubjectHoursProps {
  grade: Grade
  subject: string
  hoursPerWeek: number
}

export function SubjectHoursReportPDF({ grade, subject, hoursPerWeek }: SubjectHoursProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Colegio Lamatepec — Horas de Materia</Text>
          <Text style={styles.subtitle}>Sección {grade.label} · Año lectivo 2026</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{grade.label} · {subject}</Text>
          <Text style={styles.statValue}>{hoursPerWeek}</Text>
          <Text style={styles.statUnit}>{hoursPerWeek === 1 ? 'hora por semana' : 'horas por semana'}</Text>
        </View>
      </Page>
    </Document>
  )
}

// ─── Report 4: Grade team ─────────────────────────────────────────────────────

interface GradeTeamMember {
  teacher: Teacher
  subjects: { subject: string; hours: number }[]
  totalHours: number
}

interface GradeTeamProps {
  grade: Grade
  team: GradeTeamMember[]
}

export function GradeTeamReportPDF({ grade, team }: GradeTeamProps) {
  const grandTotal = team.reduce((s, r) => s + r.totalHours, 0)

  // Flatten to rows
  const rows: { name: string; subject: string; hours: number }[] = []
  for (const member of team) {
    for (const s of member.subjects) {
      rows.push({ name: member.teacher.name, subject: s.subject, hours: s.hours })
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Colegio Lamatepec — Equipo Educador</Text>
          <Text style={styles.subtitle}>Sección {grade.label} · {team.length} docente{team.length !== 1 ? 's' : ''} · Año lectivo 2026</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.thead}>
            <View style={styles.th}><Text>Docente</Text></View>
            <View style={styles.th}><Text>Materia</Text></View>
            <View style={styles.thRight}><Text>Horas / sem.</Text></View>
          </View>
          {rows.map((row, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tr : styles.trAlt}>
              <View style={styles.tdBold}><Text>{row.name}</Text></View>
              <View style={styles.tdMuted}><Text>{row.subject}</Text></View>
              <View style={styles.tdRight}><Text>{row.hours}</Text></View>
            </View>
          ))}
          <View style={styles.trTotal}>
            <View style={styles.tdBold}><Text>Total horas sección</Text></View>
            <View style={styles.td}><Text> </Text></View>
            <View style={styles.tdRight}><Text>{grandTotal} horas</Text></View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
