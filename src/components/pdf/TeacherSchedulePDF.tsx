import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { TIME_SLOTS, DAYS_OF_WEEK } from '../../constants/schedule'
import type { Assignment, Grade, Teacher } from '../../types'

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 8, fontFamily: 'Helvetica' },
  header: { marginBottom: 14 },
  title: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 9, color: '#64748b', marginTop: 2 },
  table: { width: '100%' },
  thead: { flexDirection: 'row', backgroundColor: '#0c1424' },
  th: { flex: 1, padding: 5, color: '#94a3b8', fontSize: 7, fontWeight: 'bold', textAlign: 'center' },
  thTime: { width: 70, padding: 5, color: '#94a3b8', fontSize: 7, fontWeight: 'bold' },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  trBreak: { flexDirection: 'row', backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  trAlt: { flexDirection: 'row', backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tdTime: { width: 70, padding: 5, color: '#64748b' },
  td: { flex: 1, padding: 5, textAlign: 'center', borderLeftWidth: 1, borderLeftColor: '#e2e8f0' },
  gradeLabel: { color: '#1e293b', fontWeight: 'bold' },
  subjectName: { color: '#64748b', marginTop: 1 },
  empty: { color: '#e2e8f0' },
  timeLabel: { color: '#334155', fontWeight: 'bold' },
  timeRange: { color: '#94a3b8', marginTop: 1 },
  breakLabel: { color: '#94a3b8', fontSize: 7 },
})

interface Props {
  teacher: Teacher
  assignments: Assignment[]
  grades: Grade[]
}

export default function TeacherSchedulePDF({ teacher, assignments, grades }: Props) {
  const gradeMap = new Map(grades.map((g) => [g.id, g]))

  function getCell(slotId: string, day: string) {
    return assignments.find((a) => a.slotId === slotId && a.day === day) ?? null
  }

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Horario — {teacher.name}</Text>
          <Text style={styles.subtitle}>{teacher.subjects.join(' · ')} · Año lectivo 2026</Text>
        </View>

        <View style={styles.table}>
          {/* Header */}
          <View style={styles.thead}>
            <View style={styles.thTime}><Text>Hora</Text></View>
            {DAYS_OF_WEEK.map((d) => (
              <View key={d.id} style={styles.th}><Text>{d.label}</Text></View>
            ))}
          </View>

          {/* Body */}
          {TIME_SLOTS.map((slot, idx) => {
            if (slot.isBreak) {
              return (
                <View key={slot.id} style={styles.trBreak}>
                  <View style={styles.tdTime}>
                    <Text style={styles.breakLabel}>{slot.startTime}–{slot.endTime}</Text>
                  </View>
                  {DAYS_OF_WEEK.map((d) => (
                    <View key={d.id} style={styles.td}>
                      <Text style={styles.breakLabel}>{slot.breakLabel}</Text>
                    </View>
                  ))}
                </View>
              )
            }

            const isAlt = idx % 2 === 0
            return (
              <View key={slot.id} style={isAlt ? styles.trAlt : styles.tr}>
                <View style={styles.tdTime}>
                  <Text style={styles.timeLabel}>{slot.label}</Text>
                  <Text style={styles.timeRange}>{slot.startTime}–{slot.endTime}</Text>
                </View>
                {DAYS_OF_WEEK.map((d) => {
                  const a = getCell(slot.id, d.id)
                  const grade = a ? gradeMap.get(a.gradeId) : null
                  return (
                    <View key={d.id} style={styles.td}>
                      {a && grade ? (
                        <>
                          <Text style={styles.gradeLabel}>{grade.label}</Text>
                          <Text style={styles.subjectName}>{a.subject}</Text>
                        </>
                      ) : (
                        <Text style={styles.empty}>—</Text>
                      )}
                    </View>
                  )
                })}
              </View>
            )
          })}
        </View>
      </Page>
    </Document>
  )
}
