import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react'
import imageCompression from 'browser-image-compression'
import { supabaseA } from '../../lib/supabaseA'
import { supabaseC } from '../../lib/supabaseC'
import { PARTIDOS, PARTIDO_IDS } from '../../data/partidos'
import { RECINTOS, RECINTO_MAP } from '../../data/recintos'

interface ReviewItem {
  mesaId: string
  recintoId: string
  recintoNombre: string
  mesaNum: number
  timestamp: string
}

export default function VerifierPanel() {
  const [queue, setQueue] = useState<ReviewItem[]>([])
  const [selectedRecinto, setSelectedRecinto] = useState('')
  const [selectedMesaNum, setSelectedMesaNum] = useState('')
  const [currentMesa, setCurrentMesa] = useState<string|null>(null)
  const [fotoUrl, setFotoUrl] = useState('')
  const [votosAlcalde, setVotosAlcalde] = useState<Record<string,string>>({})
  const [votosConcejo, setVotosConcejo] = useState<Record<string,string>>({})
  const [blancosA, setBlancosA] = useState<string>('')
  const [nulosA, setNulosA] = useState<string>('')
  const [blancosC, setBlancosC] = useState<string>('')
  const [nulosC, setNulosC] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{type:'success'|'error',text:string}|null>(null)
  const [loading, setLoading] = useState(true)
  const [newFoto, setNewFoto] = useState<File|null>(null)
  const [newFotoPreview, setNewFotoPreview] = useState('')
  const [isNewMesa, setIsNewMesa] = useState(false)
  const [mesasForRecinto, setMesasForRecinto] = useState<number>(0)
  const fileRef = useRef<HTMLInputElement>(null)

  // Fetch review queue
  const fetchQueue = async () => {
    const { data } = await supabaseA
      .from('mesas')
      .select('id, recinto_id, numero, timestamp_operador')
      .eq('estado', 'escrutada')
      .eq('verificada', false)
      .order('timestamp_operador', { ascending: true })

    if (data) {
      setQueue(data.map(m => ({
        mesaId: m.id,
        recintoId: m.recinto_id,
        recintoNombre: RECINTO_MAP[m.recinto_id]?.nombre || m.recinto_id,
        mesaNum: m.numero,
        timestamp: m.timestamp_operador || ''
      })))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, 30000) // Refresh queue every 30s
    return () => clearInterval(interval)
  }, [])

  // When recinto changes, update mesa count
  useEffect(() => {
    if (selectedRecinto) {
      const r = RECINTO_MAP[selectedRecinto]
      setMesasForRecinto(r?.totalMesas || 0)
    } else {
      setMesasForRecinto(0)
    }
    setSelectedMesaNum('')
  }, [selectedRecinto])

  const resetForm = () => {
    const empty: Record<string,string> = {}
    PARTIDO_IDS.forEach(k => { empty[k] = '' })
    setVotosAlcalde({ ...empty })
    setVotosConcejo({ ...empty })
    setBlancosA(''); setNulosA('')
    setBlancosC(''); setNulosC('')
    setFotoUrl(''); setNewFoto(null); setNewFotoPreview('')
    setIsNewMesa(false); setMsg(null)
  }

  const loadMesa = async (mesaId: string) => {
    setCurrentMesa(mesaId)
    resetForm()

    const { data: vA } = await supabaseA.from('votos_alcalde').select('*').eq('mesa_id', mesaId).single()
    const { data: vC } = await supabaseA.from('votos_concejo').select('*').eq('mesa_id', mesaId).single()

    if (vA) {
      const va: Record<string,string> = {}
      PARTIDO_IDS.forEach(k => { va[k] = vA[k] !== null ? String(vA[k]) : '' })
      setVotosAlcalde(va)
      setBlancosA(vA.blancos !== null ? String(vA.blancos) : ''); setNulosA(vA.nulos !== null ? String(vA.nulos) : '')
      if (vA.foto_url) setFotoUrl(vA.foto_url)
    } else {
      setIsNewMesa(true)
      const empty: Record<string,string> = {}
      PARTIDO_IDS.forEach(k => { empty[k] = '' })
      setVotosAlcalde({ ...empty })
    }

    if (vC) {
      const vc: Record<string,string> = {}
      PARTIDO_IDS.forEach(k => { vc[k] = vC[k] !== null ? String(vC[k]) : '' })
      setVotosConcejo(vc)
      setBlancosC(vC.blancos !== null ? String(vC.blancos) : ''); setNulosC(vC.nulos !== null ? String(vC.nulos) : '')
    } else {
      const empty: Record<string,string> = {}
      PARTIDO_IDS.forEach(k => { empty[k] = '' })
      setVotosConcejo({ ...empty })
    }
  }

  const searchMesa = () => {
    if (!selectedRecinto || !selectedMesaNum) return
    const num = parseInt(selectedMesaNum)
    const mesaId = `${selectedRecinto}-M${String(num).padStart(2, '0')}`
    loadMesa(mesaId)
  }

  const handleNewImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true
      })
      setNewFoto(compressed)
      setNewFotoPreview(URL.createObjectURL(compressed))
    } catch {
      setNewFoto(file)
      setNewFotoPreview(URL.createObjectURL(file))
    }
  }

  const confirmReview = async (e: FormEvent) => {
    e.preventDefault()
    if (!currentMesa) return
    setSaving(true); setMsg(null)

    try {
      // Upload new image if any
      let finalFotoUrl = fotoUrl
      if (newFoto) {
        const fileName = `${currentMesa}-verified-${Date.now()}.jpg`
        await supabaseA.storage.from('actas').upload(fileName, newFoto, {
          contentType: 'image/jpeg', upsert: true
        })
        const { data: urlData } = supabaseA.storage.from('actas').getPublicUrl(fileName)
        finalFotoUrl = urlData.publicUrl
      }

      // Build payloads
      const alcPayload: any = { 
        mesa_id: currentMesa, 
        blancos: blancosA === '' ? null : Number(blancosA), 
        nulos: nulosA === '' ? null : Number(nulosA), 
        foto_url: finalFotoUrl 
      }
      const conPayload: any = { 
        mesa_id: currentMesa, 
        blancos: blancosC === '' ? null : Number(blancosC), 
        nulos: nulosC === '' ? null : Number(nulosC) 
      }
      PARTIDO_IDS.forEach(k => {
        alcPayload[k] = votosAlcalde[k] === '' ? null : Number(votosAlcalde[k])
        conPayload[k] = votosConcejo[k] === '' ? null : Number(votosConcejo[k])
      })

      // Upsert in Supabase A
      if (isNewMesa) {
        await supabaseA.from('votos_alcalde').insert(alcPayload)
        await supabaseA.from('votos_concejo').insert(conPayload)
      } else {
        await supabaseA.from('votos_alcalde').update(alcPayload).eq('mesa_id', currentMesa)
        const { data: existing } = await supabaseA.from('votos_concejo').select('id').eq('mesa_id', currentMesa).single()
        if (existing) {
          await supabaseA.from('votos_concejo').update(conPayload).eq('mesa_id', currentMesa)
        } else {
          await supabaseA.from('votos_concejo').insert(conPayload)
        }
      }

      // Mark as verified
      await supabaseA.from('mesas').update({
        estado: 'verificada',
        verificada: true,
        timestamp_verificador: new Date().toISOString()
      }).eq('id', currentMesa)

      // Backup to Supabase C
      const backupAlc = { ...alcPayload, mesa_id: currentMesa, tipo: 'alcalde', foto_url: finalFotoUrl }
      delete backupAlc.id
      const backupCon = { ...conPayload, mesa_id: currentMesa, tipo: 'concejo' }
      delete backupCon.id

      await supabaseC.from('backup_votos').upsert(backupAlc, { onConflict: 'mesa_id,tipo' })
      await supabaseC.from('backup_votos').upsert(backupCon, { onConflict: 'mesa_id,tipo' })

      setMsg({ type: 'success', text: '✅ Revisión confirmada y respaldada' })
      setCurrentMesa(null)
      resetForm()
      fetchQueue()
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Error: ' + (err.message || err) })
    }
    setSaving(false)
  }

  const formatTime = (ts: string) => {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
  }

  const renderVoteFields = (
    label: string,
    votos: Record<string,string>,
    setVotos: (v: Record<string,string>) => void,
    blancos: string, setBlancos: (n:string)=>void,
    nulos: string, setNulos: (n:string)=>void
  ) => (
    <div className="form-section" style={{ marginBottom: '0.75rem' }}>
      <h3 className="form-title" style={{ fontSize: '0.9rem' }}>{label}</h3>
      {PARTIDOS.map((p,i) => (
        <div key={p.id} className="vote-row">
          <div className="vote-color-dot" style={{ backgroundColor: p.hex }} />
          <span className="vote-party-label" style={{ fontSize: '0.75rem' }}>{p.nombre}</span>
          <input type="number" className="vote-input" min={0}
            value={votos[PARTIDO_IDS[i]]}
            onChange={e => setVotos({ ...votos, [PARTIDO_IDS[i]]: e.target.value })} />
        </div>
      ))}
      <hr className="vote-divider" />
      <div className="vote-row">
        <div className="vote-color-dot" style={{ backgroundColor: '#888' }} />
        <span className="vote-party-label" style={{ fontSize: '0.75rem' }}>Blancos</span>
        <input type="number" className="vote-input" min={0} value={blancos}
          onChange={e => setBlancos(e.target.value)} />
      </div>
      <div className="vote-row">
        <div className="vote-color-dot" style={{ backgroundColor: '#444' }} />
        <span className="vote-party-label" style={{ fontSize: '0.75rem' }}>Nulos</span>
        <input type="number" className="vote-input" min={0} value={nulos}
          onChange={e => setNulos(e.target.value)} />
      </div>
    </div>
  )

  if (loading) return <div className="verifier-panel"><div className="spinner" /></div>

  return (
    <div className="verifier-panel">
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div className="dashboard-header-left">
          <h1>Panel de Verificación</h1>
        </div>
        <div className="dashboard-header-right">
          <span className="party-name">ALIANZA</span>
          <img src="/img/logo.png" alt="Logo" className="party-logo" />
        </div>
      </div>

      {/* Review Queue */}
      {queue.length > 0 && (
        <div className="review-queue">
          {queue.map((item, i) => (
            <div
              key={item.mesaId}
              className={`review-card ${currentMesa === item.mesaId ? 'active' : ''}`}
              onClick={() => loadMesa(item.mesaId)}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="review-card-mesa">Mesa {item.mesaNum}</div>
              <div className="review-card-recinto">{item.recintoNombre}</div>
              <div className="review-card-time">{formatTime(item.timestamp)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="verifier-search">
        <select value={selectedRecinto} onChange={e => setSelectedRecinto(e.target.value)}>
          <option value="">— Recinto —</option>
          {RECINTOS.map(r => (
            <option key={r.id} value={r.id}>{r.nombre}</option>
          ))}
        </select>
        <select value={selectedMesaNum} onChange={e => setSelectedMesaNum(e.target.value)}>
          <option value="">— Mesa —</option>
          {Array.from({ length: mesasForRecinto }, (_, i) => (
            <option key={i+1} value={i+1}>Mesa {i+1}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={searchMesa} style={{ minWidth: '100px' }}>
          Buscar
        </button>
      </div>

      {/* Review Content */}
      {currentMesa && (
        <form onSubmit={confirmReview}>
          <h3 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Revisando: <strong style={{ color: 'var(--text-primary)' }}>{currentMesa}</strong>
            {isNewMesa && <span style={{ color: 'var(--warning)', marginLeft: '0.5rem' }}>(Nueva)</span>}
          </h3>

          <div className="review-content">
            {/* Image panel */}
            <div className="review-image-panel">
              {(newFotoPreview || fotoUrl) ? (
                <img src={newFotoPreview || fotoUrl} alt="Acta" className="review-image" />
              ) : (
                <div className="review-image-placeholder">Sin imagen del acta</div>
              )}
              <input type="file" accept="image/*" ref={fileRef} style={{display:'none'}}
                onChange={handleNewImage} />
              <button type="button" className="btn btn-secondary" onClick={() => fileRef.current?.click()}
                style={{ marginTop: '0.75rem', width: '100%' }}>
                {fotoUrl || newFotoPreview ? '📷 Cambiar foto' : '📷 Subir foto'}
              </button>
            </div>

            {/* Form panel */}
            <div className="review-form-panel">
              {renderVoteFields('Alcalde', votosAlcalde, setVotosAlcalde, blancosA, setBlancosA, nulosA, setNulosA)}
              {renderVoteFields('Concejo', votosConcejo, setVotosConcejo, blancosC, setBlancosC, nulosC, setNulosC)}

              <button type="submit" className="btn btn-success btn-block" disabled={saving}>
                {saving ? 'Guardando...' : '✅ Confirmar Revisión Manual'}
              </button>

              {msg && <div className={`form-msg ${msg.type}`}>{msg.text}</div>}
            </div>
          </div>
        </form>
      )}

      {!currentMesa && queue.length === 0 && (
        <div className="no-data-msg">No hay mesas pendientes de revisión</div>
      )}
    </div>
  )
}
