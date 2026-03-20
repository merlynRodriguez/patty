import React, { useState, FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) { setError('Ingrese un código de acceso'); return }
    const ok = login(code)
    if (!ok) setError('Código de acceso inválido')
  }

  return (
    <div className="login-container">
      <img src="/img/logo.png" alt="Logo Alianza" className="login-logo" />
      <h1 className="login-title">ALIANZA</h1>
      <p className="login-subtitle">Unidos por los Pueblos</p>
      <form onSubmit={handleSubmit} className="login-input-wrapper">
        <input
          type="text"
          className="login-input"
          placeholder="Código de acceso"
          value={code}
          onChange={e => { setCode(e.target.value); setError('') }}
          autoFocus
          autoComplete="off"
        />
        {error && <p className="login-error">{error}</p>}
        <button type="submit" className="login-btn" style={{ marginTop: '1rem' }}>
          INGRESAR
        </button>
      </form>
    </div>
  )
}
