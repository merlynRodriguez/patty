import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabaseA } from '../../lib/supabaseA'
import { supabaseC } from '../../lib/supabaseC'

export default function ResetPanel() {
  const { logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{type: 'error'|'success', text: string} | null>(null)
  const [confirmStep, setConfirmStep] = useState(0)

  const handleReset = async () => {
    setLoading(true)
    setMsg(null)

    try {
      // Execute resets on both databases via RPC
      const { error: errA } = await supabaseA.rpc('reset_database')
      if (errA) throw errA

      const { error: errC } = await supabaseC.rpc('reset_backup')
      if (errC) throw errC

      setMsg({ type: 'success', text: '¡TODA LA BASE DE DATOS HA SIDO REINICIADA EXITOSAMENTE!' })
      setConfirmStep(0)
    } catch (e: any) {
      console.error(e)
      setMsg({ type: 'error', text: 'Error al reiniciar la base de datos: ' + e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="verifier-panel fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: 'var(--radius)', border: '2px solid red', maxWidth: '600px', textAlign: 'center' }}>
        <h1 style={{ color: 'red', fontSize: '2rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
          ⚠️ Zona de Peligro ⚠️
        </h1>
        
        <p style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
          Estás a punto de borrar todos los votos escrutados en la base de datos y reiniciar todas las mesas.
        </p>

        {msg && (
          <div className={`form-msg ${msg.type}`} style={{ marginBottom: '1.5rem', padding: '1rem', fontSize: '1rem' }}>
            {msg.text}
          </div>
        )}

        {confirmStep === 0 && (
          <button 
            className="btn btn-primary"
            style={{ background: 'red', fontSize: '1.1rem', padding: '15px 30px' }}
            onClick={() => setConfirmStep(1)}
            disabled={loading}
          >
            RESTABLECER DATOS A CERO
          </button>
        )}

        {confirmStep === 1 && (
          <div className="fade-in" style={{ background: 'rgba(255,0,0,0.1)', padding: '2rem', borderRadius: '8px' }}>
            <h3 style={{ color: 'red', marginBottom: '1rem' }}>¿Estás completamente seguro?</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Esta acción NO se puede deshacer de forma sencilla.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setConfirmStep(0)}
              >
                Cancelar
              </button>
              <button 
                className="btn"
                style={{ background: '#900', color: 'white' }}
                onClick={handleReset}
                disabled={loading}
              >
                {loading ? 'Borrando...' : 'SÍ, ESTOY SEGURO - BORRAR TODO'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
