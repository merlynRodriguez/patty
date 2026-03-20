import React from 'react'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Dashboard from './components/dashboard/Dashboard'
import OperatorPanel from './components/operator/OperatorPanel'
import VerifierPanel from './components/verifier/VerifierPanel'
import ResetPanel from './components/reset/ResetPanel'

export default function App() {
  const { role, logout } = useAuth()

  if (!role) return <Login />

  return (
    <>
      <button className="logout-btn" onClick={logout}>Salir</button>
      {role === 'dashboard' && <Dashboard />}
      {role === 'operador' && <OperatorPanel />}
      {role === 'verificador' && <VerifierPanel />}
      {role === 'admin_reset' && <ResetPanel />}
    </>
  )
}
