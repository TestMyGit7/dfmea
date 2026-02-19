import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { User, UserRole } from '@/types'
import { MOCK_USERS, ROLE_ROUTES } from '@/config/auth'
import { useNavigate } from 'react-router-dom'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hasRole: (role: UserRole | UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('dfmea_user')
    return stored ? (JSON.parse(stored) as User) : null
  })

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      const found = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      )
      if (!found) {
        return { success: false, error: 'Invalid email or password' }
      }
      // Store without password
      const safeUser: User = { ...found }
      localStorage.setItem('dfmea_user', JSON.stringify(safeUser))
      localStorage.setItem('dfmea_token', `mock-jwt-${found.id}-${Date.now()}`)
      setUser(safeUser)
      navigate(ROLE_ROUTES[found.role])
      return { success: true }
    },
    [navigate]
  )

  const logout = useCallback(() => {
    localStorage.removeItem('dfmea_user')
    localStorage.removeItem('dfmea_token')
    setUser(null)
    navigate('/login')
  }, [navigate])

  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (!user) return false
      if (Array.isArray(role)) return role.includes(user.role)
      return user.role === role
    },
    [user]
  )

  // Redirect on mount if already authenticated
  useEffect(() => {
    if (user && window.location.pathname === '/login') {
      navigate(ROLE_ROUTES[user.role])
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
