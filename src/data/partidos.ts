export interface Partido {
  id: string
  nombre: string
  color: string
  hex: string
}

export const PARTIDOS: Partido[] = [
  { id: 'P01', nombre: 'NGP',         color: 'naranja mostaza', hex: '#f18c28' },
  { id: 'P02', nombre: 'MTS',         color: 'verde',           hex: '#00a135' },
  { id: 'P03', nombre: 'PATRIA',      color: 'naranja',         hex: '#FD4F00' },
  { id: 'P04', nombre: 'SUMATE',      color: 'purpura',         hex: '#7D21B1' },
  { id: 'P05', nombre: 'UNIDOS',      color: 'rojo',            hex: '#df0900' },
  { id: 'P06', nombre: 'FRI',         color: 'azul marino',     hex: '#0d143b' },
  { id: 'P07', nombre: 'UNE',         color: 'celeste',         hex: '#00b8ff' },
  { id: 'P08', nombre: 'LIBRE',       color: 'azul',            hex: '#0000ff' },
  { id: 'P09', nombre: 'PPS',         color: 'amarillo',        hex: '#ffff00' },
  { id: 'P10', nombre: 'SOLUCIONES',  color: 'rosado',          hex: '#f992b7' },
  { id: 'P11', nombre: 'ALIANZA',     color: 'burdeos',         hex: '#6f000e' },
]

export const PARTIDO_MAP: Record<string, Partido> = Object.fromEntries(
  PARTIDOS.map(p => [p.id, p])
)

export const PARTIDO_IDS = ['p01','p02','p03','p04','p05','p06','p07','p08','p09','p10','p11'] as const
