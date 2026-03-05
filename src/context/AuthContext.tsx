import { createContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { AuthUser } from '../types'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId: string, email: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, teacher_id')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('fetchProfile error:', error.message)
        return null
      }
      if (!data) return null
      return {
        id: userId,
        email,
        role: data.role as 'admin' | 'teacher',
        teacherId: data.teacher_id ?? null,
      }
    } catch (err) {
      console.error('fetchProfile unexpected error:', err)
      return null
    }
  }

  useEffect(() => {
    // NOTE: onAuthStateChange does not support async callbacks in supabase-js v2.
    // The async work must be triggered outside the callback to avoid the event
    // being dropped and loading never resolving.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email ?? '')
          .then((profile) => setUser(profile))
          .catch((err) => {
            console.error('onAuthStateChange handler error:', err)
            setUser(null)
          })
          .finally(() => setLoading(false))
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
