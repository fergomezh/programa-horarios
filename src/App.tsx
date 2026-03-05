import { useAuth } from './hooks/useAuth'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import TeacherView from './pages/TeacherView'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0c1424' }}
      >
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <LoginPage />
  if (user.role === 'teacher') return <TeacherView />
  return <AppLayout />
}
