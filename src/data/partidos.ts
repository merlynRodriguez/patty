export interface Partido {
  id: string
  nombre: string
  color: string
  hex: string
}

export const PARTIDOS: Partido[] = [
  { id: 'P01', nombre: 'UNIDOS',      color: 'rojo',            hex: '#df0900' },
  { id: 'P02', nombre: 'NGP',         color: 'naranja mostaza', hex: '#f18c28' },
  { id: 'P03', nombre: 'PPS',         color: 'amarillo',        hex: '#ffff00' },
  { id: 'P04', nombre: 'UNE',         color: 'celeste',         hex: '#00b8ff' },
  { id: 'P05', nombre: 'PATRIA',      color: 'naranja',         hex: '#FD4F00' },
  { id: 'P06', nombre: 'MTS',         color: 'verde',           hex: '#00a135' },
  { id: 'P07', nombre: 'SUMATE',      color: 'purpura',         hex: '#7D21B1' },
  { id: 'P08', nombre: 'ALIANZA',     color: 'burdeos',         hex: '#6f000e' },
  { id: 'P09', nombre: 'FRI',         color: 'azul marino',     hex: '#0d143b' },
  { id: 'P10', nombre: 'LIBRE',       color: 'azul',            hex: '#0000ff' },
  { id: 'P11', nombre: 'SOLUCIONES',  color: 'rosado',          hex: '#f992b7' },
]

export const PARTIDO_MAP: Record<string, Partido> = Object.fromEntries(
  PARTIDOS.map(p => [p.id, p])
)

export const PARTIDO_IDS = ['p01','p02','p03','p04','p05','p06','p07','p08','p09','p10','p11'] as const
