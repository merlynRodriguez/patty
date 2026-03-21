import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import { supabaseA } from '../../lib/supabaseA'
import { PARTIDOS, PARTIDO_IDS, PARTIDO_MAP } from '../../data/partidos'
import { CANDIDATO_ALCALDE_MAP, CANDIDATOS_CONCEJO } from '../../data/candidatos'
import { RECINTOS, TOTAL_MESAS } from '../../data/recintos'
import { calcularDhondt } from '../../lib/dhondt'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

interface Totales {
  p01: number; p02: number; p03: number; p04: number; p05: number; p06: number;
  p07: number; p08: number; p09: number; p10: number; p11: number;
  blancos: number; nulos: number; mesas_escrutadas?: number; updated_at?: string;
}

const emptyTotales: Totales = {
  p01:0,p02:0,p03:0,p04:0,p05:0,p06:0,p07:0,p08:0,p09:0,p10:0,p11:0,blancos:0,nulos:0,mesas_escrutadas:0
}

export default function Dashboard() {
  const [tab, setTab] = useState<'alcalde'|'concejo'>('alcalde')
  const [totAlcalde, setTotAlcalde] = useState<Totales>(emptyTotales)
  const [totConcejo, setTotConcejo] = useState<Totales>(emptyTotales)
  const [loading, setLoading] = useState(true)
  const [recintoId, setRecintoId] = useState('')
  const [recintoAlcalde, setRecintoAlcalde] = useState<Totales|null>(null)
  const [recintoConcejo, setRecintoConcejo] = useState<Totales|null>(null)
  const [loadingRecinto, setLoadingRecinto] = useState(false)
  const lastUpdated = useRef('')

  const fetchTotales = useCallback(async () => {
    const [{ data: alcData }, { data: conData }] = await Promise.all([
      supabaseA.from('totales_alcalde').select('*').eq('id',1).single(),
      supabaseA.from('totales_concejo').select('*').eq('id',1).single()
    ])
    if (alcData) {
      if (lastUpdated.current && lastUpdated.current === alcData.updated_at) return
      lastUpdated.current = alcData.updated_at || ''
      setTotAlcalde(alcData)
    }
    if (conData) setTotConcejo(conData)
    setLoading(false)
  }, [])

  useEffect(() => {
    let timeoutId: number;

    const scheduleFetch = () => {
      // 30s + jitter de hasta 5s para evitar colisiones distribuyendo la carga
      const delay = 30000 + Math.random() * 5000;
      timeoutId = window.setTimeout(async () => {
        await fetchTotales();
        scheduleFetch();
      }, delay);
    };

    fetchTotales();
    scheduleFetch();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [fetchTotales])

  // Fetch recinto detail
  useEffect(() => {
    if (!recintoId) { setRecintoAlcalde(null); setRecintoConcejo(null); return }
    const fetchRecinto = async () => {
      setLoadingRecinto(true)
      const { data: mesas } = await supabaseA
        .from('mesas').select('id').eq('recinto_id', recintoId)
      if (!mesas || mesas.length === 0) { setLoadingRecinto(false); return }
      const mesaIds = mesas.map(m => m.id)

      const [{ data: vAlc }, { data: vCon }] = await Promise.all([
        supabaseA.from('votos_alcalde').select('*').in('mesa_id', mesaIds),
        supabaseA.from('votos_concejo').select('*').in('mesa_id', mesaIds)
      ])

      const sumVotes = (rows: any[]): Totales => {
        const t = { ...emptyTotales }
        rows.forEach(r => {
          PARTIDO_IDS.forEach(pid => { (t as any)[pid] += r[pid] || 0 })
          t.blancos += r.blancos || 0
          t.nulos += r.nulos || 0
        })
        return t
      }

      setRecintoAlcalde(vAlc ? sumVotes(vAlc) : null)
      setRecintoConcejo(vCon ? sumVotes(vCon) : null)
      setLoadingRecinto(false)
    }
    fetchRecinto()
  }, [recintoId])

  const getVotesArray = (t: Totales) => PARTIDO_IDS.map(pid => (t as any)[pid] as number)
  const totalVotos = (t: Totales) => getVotesArray(t).reduce((a,b)=>a+b,0)
  const getVotesMap = (t: Totales): Record<string,number> => {
    const m: Record<string,number> = {}
    PARTIDOS.forEach((p,i) => { m[p.id] = (t as any)[PARTIDO_IDS[i]] })
    return m
  }

  const sortedPartidos = (t: Totales) => {
    return PARTIDOS.map((p,i) => ({
      ...p, votos: (t as any)[PARTIDO_IDS[i]] as number
    })).sort((a,b) => b.votos - a.votos)
  }

  const mesasEscrutadas = totAlcalde.mesas_escrutadas || 0
  const pctMesas = TOTAL_MESAS > 0 ? Math.round((mesasEscrutadas/TOTAL_MESAS)*100) : 0

  const pieData = (t: Totales) => {
    const sorted = sortedPartidos(t)
    const total = totalVotos(t)
    return {
      labels: sorted.map(p => `${p.nombre} ${total > 0 ? ((p.votos/total)*100).toFixed(1) : 0}%`),
      datasets: [{
        data: sorted.map(p => p.votos),
        backgroundColor: sorted.map(p => p.hex),
        borderColor: sorted.map(() => 'rgba(0,0,0,0.3)'),
        borderWidth: 1
      }]
    }
  }

  const pieOpts = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#9a9ab0',
          font: { size: 10, family: 'Inter' },
          padding: 8,
          boxWidth: 12
        }
      }
    }
  }

  // Get winner
  const getWinner = (t: Totales) => {
    const sorted = sortedPartidos(t)
    if (sorted.length === 0 || sorted[0].votos === 0) return null
    const w = sorted[0]
    const cand = CANDIDATO_ALCALDE_MAP[w.id]
    return { partido: w, candidato: cand }
  }

  // D'Hondt seats
  const calculateSeats = (t: Totales) => {
    const votesMap = getVotesMap(t)
    const results = calcularDhondt(votesMap, 9)
    const seats: { nombre: string; partido: string; hex: string }[] = []
    results.forEach(r => {
      const partido = PARTIDO_MAP[r.partidoId]
      const concejales = CANDIDATOS_CONCEJO
        .filter(c => c.partidoId === r.partidoId)
        .sort((a,b) => a.jerarquia.localeCompare(b.jerarquia))
      for (let i = 0; i < r.escanos && i < concejales.length; i++) {
        seats.push({
          nombre: concejales[i].nombre,
          partido: partido?.nombre || '',
          hex: partido?.hex || '#666'
        })
      }
    })
    return seats
  }

  const winner = getWinner(totAlcalde)

  const renderBarChart = (t: Totales) => {
    const sorted = sortedPartidos(t)
    const maxVotos = Math.max(...sorted.map(p => p.votos), 1)
    return (
      <div className="bar-chart-section fade-in">
        {sorted.map(p => (
          <div key={p.id} className="bar-item">
            <span className="bar-party-name">{p.nombre}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{
                width: `${(p.votos/maxVotos)*100}%`,
                backgroundColor: p.hex
              }} />
            </div>
            <span className="bar-votes">{p.votos.toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) return <div className="dashboard"><div className="spinner" /></div>

  return (
    <div className="dashboard fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Elecciones Subnacionales 2026</h1>
          <h2>Municipio de Vinto</h2>
        </div>
        <div className="dashboard-header-right">
          <span className="party-name">ALIANZA</span>
          <img src="/img/logo.png" alt="Logo" className="party-logo" />
        </div>
      </div>

      {/* Progress */}
      <div className="progress-section">
        <div className="progress-label">
          <span>Mesas escrutadas: {mesasEscrutadas}/{TOTAL_MESAS}</span>
          <span className="progress-pct">{pctMesas}%</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${pctMesas}%` }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${tab==='alcalde'?'active':''}`} onClick={()=>setTab('alcalde')}>Alcalde</button>
        <button className={`tab-btn ${tab==='concejo'?'active':''}`} onClick={()=>setTab('concejo')}>Concejo</button>
      </div>

      {/* Tab Content: Alcalde */}
      {tab === 'alcalde' && (
        <div className="fade-in">
          <div className="winner-section">
            <div className="winner-card">
              {winner ? (
                <>
                  <div className="winner-label-top">Candidato con más Votos</div>
                  <div className="winner-label-bottom">Próximo Alcalde</div>
                  <img
                    src={`/candidatos/${winner.candidato.id}.jpg`}
                    alt={winner.candidato.nombre}
                    className="winner-photo"
                  />
                  <div className="winner-name">{winner.candidato.nombre}</div>
                  <div className="winner-party" style={{ color: winner.partido.hex }}>
                    {winner.partido.nombre}
                  </div>
                </>
              ) : (
                <div className="no-data-msg">Sin datos aún</div>
              )}
            </div>
            <div className="chart-container">
              {totalVotos(totAlcalde) > 0 ? (
                <Pie data={pieData(totAlcalde)} options={pieOpts} />
              ) : (
                <div className="no-data-msg">Sin votos registrados</div>
              )}
            </div>
          </div>
          {renderBarChart(totAlcalde)}
        </div>
      )}

      {/* Tab Content: Concejo */}
      {tab === 'concejo' && (
        <div className="fade-in">
          <div className="seats-section">
            <h3 className="section-title">Composición del Concejo Municipal</h3>
            <div className="seats-grid">
              {totalVotos(totConcejo) > 0 ? (
                calculateSeats(totConcejo).map((seat, i) => (
                  <div key={i} className="seat-item">
                    <div className="seat-silhouette" style={{ 
                      color: seat.hex,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div className="seat-info">
                      <div className="seat-name">{seat.nombre}</div>
                      <div className="seat-party">{seat.partido}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-msg">Sin datos para calcular escaños</div>
              )}
            </div>
            <div className="chart-container">
              {totalVotos(totConcejo) > 0 ? (
                <Pie data={pieData(totConcejo)} options={pieOpts} />
              ) : (
                <div className="no-data-msg">Sin votos registrados</div>
              )}
            </div>
          </div>
          {renderBarChart(totConcejo)}
        </div>
      )}

      {/* Detalle por recinto */}
      <div className="recinto-section">
        <h3 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Detalle por Recinto Electoral</h3>
        <select
          className="recinto-select"
          value={recintoId}
          onChange={e => setRecintoId(e.target.value)}
        >
          <option value="">— Seleccione un recinto —</option>
          {RECINTOS.map(r => (
            <option key={r.id} value={r.id}>{r.nombre} ({r.totalMesas} mesas)</option>
          ))}
        </select>

        {loadingRecinto && <div className="spinner" />}

        {recintoId && recintoAlcalde && !loadingRecinto && (
          <div className="fade-in">
            <h4 className="recinto-section-title">Alcalde</h4>
            <div style={{ maxWidth: 300, margin: '0 auto 1rem' }}>
              {totalVotos(recintoAlcalde) > 0 ? (
                <Pie data={pieData(recintoAlcalde)} options={pieOpts} />
              ) : (
                <div className="no-data-msg">Sin votos</div>
              )}
            </div>
            {renderBarChart(recintoAlcalde)}

            <hr className="recinto-divider" />

            <h4 className="recinto-section-title">Concejo</h4>
            {recintoConcejo && (
              <>
                <div style={{ maxWidth: 300, margin: '0 auto 1rem' }}>
                  {totalVotos(recintoConcejo) > 0 ? (
                    <Pie data={pieData(recintoConcejo)} options={pieOpts} />
                  ) : (
                    <div className="no-data-msg">Sin votos</div>
                  )}
                </div>
                {renderBarChart(recintoConcejo)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
