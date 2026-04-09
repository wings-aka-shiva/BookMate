import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface AuthUser {
  token: string
  displayName: string
  userId: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem('token')
    const displayName = localStorage.getItem('displayName')
    const userId = localStorage.getItem('userId')
    if (token && displayName && userId) {
      return { token, displayName, userId }
    }
    return null
  })

  const login = (userData: AuthUser) => {
    localStorage.setItem('token', userData.token)
    localStorage.setItem('displayName', userData.displayName)
    localStorage.setItem('userId', userData.userId)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('displayName')
    localStorage.removeItem('userId')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}