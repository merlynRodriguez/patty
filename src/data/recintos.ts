export interface Recinto {
  id: string
  nombre: string
  totalMesas: number
  codigoAcceso: string
}

export const RECINTOS: Recinto[] = [
  { id: 'R01', nombre: 'Escuela Melchor Cuadros',                  totalMesas: 30, codigoAcceso: 'EMC01' },
  { id: 'R02', nombre: 'U.E Vargas Linde',                         totalMesas: 26, codigoAcceso: 'UVL02' },
  { id: 'R03', nombre: 'Escuela Martín Cárdenas',                  totalMesas: 21, codigoAcceso: 'EMC03' },
  { id: 'R04', nombre: 'Unidad Educativa David Arzabe',            totalMesas: 16, codigoAcceso: 'UDA04' },
  { id: 'R05', nombre: 'Escuela Ismael Montes',                    totalMesas: 16, codigoAcceso: 'EIM05' },
  { id: 'R06', nombre: 'Unidad Educativa Sagrada Familia',         totalMesas: 15, codigoAcceso: 'USF06' },
  { id: 'R07', nombre: 'Unidad Educativa Anocaraire',              totalMesas: 14, codigoAcceso: 'UAN07' },
  { id: 'R08', nombre: 'Núcleo Escolar Simón Bolívar (Thiomoko)',  totalMesas: 9,  codigoAcceso: 'NSB08' },
  { id: 'R09', nombre: 'U.E. Avelino Mérida Zubieta',             totalMesas: 8,  codigoAcceso: 'AMZ09' },
  { id: 'R10', nombre: 'U.E. María Ayma',                          totalMesas: 6,  codigoAcceso: 'UMA10' },
  { id: 'R11', nombre: 'U.E. 5 de Septiembre',                     totalMesas: 5,  codigoAcceso: 'SEP11' },
  { id: 'R12', nombre: 'U.E. Soledad Rivas',                       totalMesas: 5,  codigoAcceso: 'USR12' },
  { id: 'R13', nombre: 'U.E. Álvaro García Linera',                totalMesas: 5,  codigoAcceso: 'AGL13' },
  { id: 'R14', nombre: 'U.E. Simón I. Patiño',                     totalMesas: 4,  codigoAcceso: 'SIP14' },
  { id: 'R15', nombre: 'U.E. Carmen Rosa Salguero',                totalMesas: 3,  codigoAcceso: 'CRS15' },
  { id: 'R16', nombre: 'U.E. Nuestra Señora del Rosario',          totalMesas: 3,  codigoAcceso: 'NSR16' },
  { id: 'R17', nombre: 'U.E. Combuyo',                             totalMesas: 3,  codigoAcceso: 'COM17' },
  { id: 'R18', nombre: 'U.E. Vilomilla',                           totalMesas: 3,  codigoAcceso: 'VIL18' },
  { id: 'R19', nombre: 'U.E. Bartolina Sisa',                      totalMesas: 3,  codigoAcceso: 'BSI19' },
  { id: 'R20', nombre: 'Unidad Educativa Keraya',                  totalMesas: 2,  codigoAcceso: 'KER20' },
  { id: 'R21', nombre: 'U.E. La Llave',                            totalMesas: 2,  codigoAcceso: 'LLA21' },
]

export const RECINTO_BY_CODE: Record<string, Recinto> = Object.fromEntries(
  RECINTOS.map(r => [r.codigoAcceso.toUpperCase(), r])
)

export const RECINTO_MAP: Record<string, Recinto> = Object.fromEntries(
  RECINTOS.map(r => [r.id, r])
)

export const TOTAL_MESAS = 199

// Genera IDs de mesas para un recinto
export function getMesaIds(recintoId: string, totalMesas: number): string[] {
  return Array.from({ length: totalMesas }, (_, i) =>
    `${recintoId}-M${String(i + 1).padStart(2, '0')}`
  )
}
