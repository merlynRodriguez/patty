import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { RECINTO_BY_CODE, Recinto } from '../data/recintos'

type UserRole = 'dashboard' | 'operador' | 'verificador' | 'admin_reset' | null

interface AuthState {
  role: UserRole
  recinto: Recinto | null
  code: string
  login: (code: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  role: null, recinto: null, code: '',
  login: () => false, logout: () => { }
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null)
  const [recinto, setRecinto] = useState<Recinto | null>(null)
  const [code, setCode] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('electoral_auth')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setRole(data.role)
        setCode(data.code)
        if (data.recinto) setRecinto(data.recinto)
      } catch { /* ignore */ }
    }
  }, [])

  const login = (inputCode: string): boolean => {
    const normalized = inputCode.trim().toUpperCase()

    if (normalized === 'PATTY') {
      setRole('dashboard')
      setCode(normalized)
      localStorage.setItem('electoral_auth', JSON.stringify({ role: 'dashboard', code: normalized }))
      return true
    }

    if (normalized === '79974740') {
      setRole('verificador')
      setCode(normalized)
      localStorage.setItem('electoral_auth', JSON.stringify({ role: 'verificador', code: normalized }))
      return true
    }

    if (normalized === 'LADONNAEMOBILE1.') {
      setRole('admin_reset')
      setCode(normalized)
      localStorage.setItem('electoral_auth', JSON.stringify({ role: 'admin_reset', code: normalized }))
      return true
    }

    const found = RECINTO_BY_CODE[normalized]
    if (found) {
      setRole('operador')
      setRecinto(found)
      setCode(normalized)
      localStorage.setItem('electoral_auth', JSON.stringify({ role: 'operador', code: normalized, recinto: found }))
      return true
    }

    return false
  }

  const logout = () => {
    setRole(null)
    setRecinto(null)
    setCode('')
    localStorage.removeItem('electoral_auth')
  }

  return (
    <AuthContext.Provider value={{ role, recinto, code, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
