import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react'
import imageCompression from 'browser-image-compression'
import { supabaseA } from '../../lib/supabaseA'
import { useAuth } from '../../context/AuthContext'
import { PARTIDOS, PARTIDO_IDS } from '../../data/partidos'
import { getMesaIds } from '../../data/recintos'

interface MesaStatus { id: string; escrutada: boolean; verificada: boolean }

export default function OperatorPanel() {
  const { recinto } = useAuth()
  const [mesas, setMesas] = useState<MesaStatus[]>([])
  const [selectedMesa, setSelectedMesa] = useState('')
  const [step, setStep] = useState<'select'|'alcalde'|'concejo'>('select')
  const [votosAlcalde, setVotosAlcalde] = useState<Record<string,string>>({})
  const [votosConcejo, setVotosConcejo] = useState<Record<string,string>>({})
  const [blancosA, setBlancosA] = useState<string>('')
  const [nulosA, setNulosA] = useState<string>('')
  const [blancosC, setBlancosC] = useState<string>('')
  const [nulosC, setNulosC] = useState<string>('')
  const [foto, setFoto] = useState<File|null>(null)
  const [fotoPreview, setFotoPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{type:'success'|'error', text:string}|null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!recinto) return
    fetchMesas()
  }, [recinto])

  const fetchMesas = async () => {
    if (!recinto) return
    setLoading(true)
    const mesaIds = getMesaIds(recinto.id, recinto.totalMesas)
    const { data } = await supabaseA
      .from('mesas')
      .select('id, estado, verificada')
      .in('id', mesaIds)
    const statuses: MesaStatus[] = mesaIds.map(id => {
      const m = data?.find(d => d.id === id)
      return {
        id,
        escrutada: m?.estado === 'escrutada' || m?.estado === 'verificada',
        verificada: m?.verificada || false
      }
    })
    setMesas(statuses)
    setLoading(false)
  }

  const resetForm = () => {
    const empty: Record<string,string> = {}
    PARTIDO_IDS.forEach(k => { empty[k] = '' })
    setVotosAlcalde({ ...empty })
    setVotosConcejo({ ...empty })
    setBlancosA(''); setNulosA('')
    setBlancosC(''); setNulosC('')
    setFoto(null); setFotoPreview(''); setEditMode(false)
  }

  const selectMesa = async (mesaId: string) => {
    setSelectedMesa(mesaId)
    setMsg(null)
    resetForm()

    const mesa = mesas.find(m => m.id === mesaId)
    if (mesa?.verificada) {
      // Already verified, cannot edit
      setStep('select')
      setMsg({ type: 'error', text: 'Esta mesa ya fue verificada y no puede editarse.' })
      return
    }

    if (mesa?.escrutada) {
      // Load existing data for editing
      setEditMode(true)
      const { data: vA } = await supabaseA.from('votos_alcalde').select('*').eq('mesa_id', mesaId).single()
      const { data: vC } = await supabaseA.from('votos_concejo').select('*').eq('mesa_id', mesaId).single()
      if (vA) {
        const va: Record<string,string> = {}
        PARTIDO_IDS.forEach(k => { va[k] = vA[k] !== null ? String(vA[k]) : '' })
        setVotosAlcalde(va)
        setBlancosA(vA.blancos !== null ? String(vA.blancos) : ''); setNulosA(vA.nulos !== null ? String(vA.nulos) : '')
        if (vA.foto_url) setFotoPreview(vA.foto_url)
      }
      if (vC) {
        const vc: Record<string,string> = {}
        PARTIDO_IDS.forEach(k => { vc[k] = vC[k] !== null ? String(vC[k]) : '' })
        setVotosConcejo(vc)
        setBlancosC(vC.blancos !== null ? String(vC.blancos) : ''); setNulosC(vC.nulos !== null ? String(vC.nulos) : '')
      }
      setStep('alcalde')
    } else {
      const empty: Record<string,string> = {}
      PARTIDO_IDS.forEach(k => { empty[k] = '' })
      setVotosAlcalde({ ...empty })
      setVotosConcejo({ ...empty })
      setStep('alcalde')
    }
  }

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true
      })
      setFoto(compressed)
      setFotoPreview(URL.createObjectURL(compressed))
    } catch {
      setFoto(file)
      setFotoPreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (): Promise<string|null> => {
    if (!foto) return fotoPreview || null
    const fileName = `${selectedMesa}-${Date.now()}.jpg`
    const { error } = await supabaseA.storage
      .from('actas')
      .upload(fileName, foto, { contentType: 'image/jpeg', upsert: true })
    if (error) { console.error('Upload error:', error); return null }
    const { data: urlData } = supabaseA.storage.from('actas').getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const saveAlcaldeAndContinue = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg(null)
    try {
      const fotoUrl = await uploadImage()
      const payload: any = { 
        mesa_id: selectedMesa, 
        blancos: blancosA === '' ? null : Number(blancosA), 
        nulos: nulosA === '' ? null : Number(nulosA) 
      }
      if (fotoUrl) payload.foto_url = fotoUrl
      PARTIDO_IDS.forEach(k => { payload[k] = votosAlcalde[k] === '' ? null : Number(votosAlcalde[k]) })

      if (editMode) {
        const { error } = await supabaseA.from('votos_alcalde')
          .update(payload).eq('mesa_id', selectedMesa)
        if (error) throw error
      } else {
        const { error } = await supabaseA.from('votos_alcalde').insert(payload)
        if (error) throw error
      }
      setStep('concejo')
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Error al guardar: ' + (err.message || err) })
    }
    setSaving(false)
  }

  const saveConcejo = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg(null)
    try {
      const payload: any = { 
        mesa_id: selectedMesa, 
        blancos: blancosC === '' ? null : Number(blancosC), 
        nulos: nulosC === '' ? null : Number(nulosC) 
      }
      PARTIDO_IDS.forEach(k => { payload[k] = votosConcejo[k] === '' ? null : Number(votosConcejo[k]) })

      if (editMode) {
        const { data: existing } = await supabaseA.from('votos_concejo').select('id').eq('mesa_id', selectedMesa).single()
        if (existing) {
          const { error } = await supabaseA.from('votos_concejo')
            .update(payload).eq('mesa_id', selectedMesa)
          if (error) throw error
        } else {
          const { error } = await supabaseA.from('votos_concejo').insert(payload)
          if (error) throw error
        }
      } else {
        const { error } = await supabaseA.from('votos_concejo').insert(payload)
        if (error) throw error
      }

      // Update mesa estado
      await supabaseA.from('mesas')
        .update({ estado: 'escrutada', timestamp_operador: new Date().toISOString() })
        .eq('id', selectedMesa)

      setMsg({ type: 'success', text: '✅ Datos guardados correctamente' })
      setStep('select')
      setSelectedMesa('')
      resetForm()
      fetchMesas()
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Error al guardar: ' + (err.message || err) })
    }
    setSaving(false)
  }

  const renderVoteForm = (
    title: string,
    votos: Record<string,string>,
    setVotos: (v: Record<string,string>) => void,
    blancos: string, setBlancos: (n:string) => void,
    nulos: string, setNulos: (n:string) => void,
    onSubmit: (e: FormEvent) => void,
    isAlcalde: boolean
  ) => (
    <form onSubmit={onSubmit}>
      <div className="form-section fade-in">
        <h3 className="form-title">{title} — {selectedMesa}</h3>
        {PARTIDOS.map((p, i) => (
          <div key={p.id} className="vote-row">
            <div className="vote-color-dot" style={{ backgroundColor: p.hex }} />
            <span className="vote-party-label">{p.nombre}</span>
            <input
              type="number"
              className="vote-input"
              min={0}
              value={votos[PARTIDO_IDS[i]]}
              onChange={e => setVotos({ ...votos, [PARTIDO_IDS[i]]: e.target.value })}
            />
          </div>
        ))}
        <hr className="vote-divider" />
        <div className="vote-row">
          <div className="vote-color-dot" style={{ backgroundColor: '#888' }} />
          <span className="vote-party-label">Votos Blancos</span>
          <input type="number" className="vote-input" min={0} value={blancos}
            onChange={e => setBlancos(e.target.value)} />
        </div>
        <div className="vote-row">
          <div className="vote-color-dot" style={{ backgroundColor: '#444' }} />
          <span className="vote-party-label">Votos Nulos</span>
          <input type="number" className="vote-input" min={0} value={nulos}
            onChange={e => setNulos(e.target.value)} />
        </div>
      </div>

      {isAlcalde && (
        <div className="image-upload-section fade-in">
          <h3 className="form-title" style={{ marginBottom: '0.75rem' }}>Foto del Acta</h3>
          {fotoPreview && (
            <img src={fotoPreview} alt="Preview" className="image-upload-preview" />
          )}
          <input type="file" accept="image/*" ref={fileRef} style={{display:'none'}}
            onChange={handleImageSelect} />
          <input type="file" accept="image/*" capture="environment" ref={cameraRef}
            style={{display:'none'}} onChange={handleImageSelect} />
          <div className="image-upload-btns">
            <button type="button" className="btn btn-secondary" onClick={()=>cameraRef.current?.click()}>
              📷 Cámara
            </button>
            <button type="button" className="btn btn-secondary" onClick={()=>fileRef.current?.click()}>
              🖼️ Galería
            </button>
          </div>
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
        {saving ? 'Guardando...' : isAlcalde ? 'Guardar y continuar con Concejo →' : '✅ Guardar Concejo'}
      </button>
      {msg && <div className={`form-msg ${msg.type}`}>{msg.text}</div>}
    </form>
  )

  if (!recinto) return <div className="operator-panel"><p className="no-data-msg">Error: sin recinto asignado</p></div>
  if (loading) return <div className="operator-panel"><div className="spinner" /></div>

  return (
    <div className="operator-panel">
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div className="dashboard-header-left">
          <h1>Portal del Operador</h1>
          <h2>{recinto.nombre}</h2>
        </div>
        <div className="dashboard-header-right">
          <span className="party-name">ALIANZA</span>
          <img src="/img/logo.png" alt="Logo" className="party-logo" />
        </div>
      </div>

      {step === 'select' && (
        <>
          <select
            className="op-mesa-select"
            value={selectedMesa}
            onChange={e => selectMesa(e.target.value)}
          >
            <option value="">— Seleccione una mesa —</option>
            {mesas.map(m => (
              <option key={m.id} value={m.id}>
                {m.verificada ? '🔒 ' : m.escrutada ? '✅ ' : ''}
                Mesa {m.id.split('-M')[1]?.replace(/^0/,'')}
                {m.verificada ? ' (Verificada)' : m.escrutada ? ' (Escrutada)' : ''}
              </option>
            ))}
          </select>
          {msg && <div className={`form-msg ${msg.type}`}>{msg.text}</div>}
        </>
      )}

      {step === 'alcalde' && renderVoteForm(
        'Votos Alcalde', votosAlcalde, setVotosAlcalde,
        blancosA, setBlancosA, nulosA, setNulosA,
        saveAlcaldeAndContinue, true
      )}

      {step === 'concejo' && renderVoteForm(
        'Votos Concejo', votosConcejo, setVotosConcejo,
        blancosC, setBlancosC, nulosC, setNulosC,
        saveConcejo, false
      )}
    </div>
  )
}
