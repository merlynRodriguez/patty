// Método D'Hondt para calcular distribución de escaños
// totalSeats = número de escaños a repartir
// votes = objeto { partidoId: totalVotos }
// Returns: objeto { partidoId: numEscaños }

export interface DhondtResult {
  partidoId: string
  escanos: number
}

export function calcularDhondt(
  votes: Record<string, number>,
  totalSeats: number
): DhondtResult[] {
  const partidos = Object.keys(votes).filter(k => votes[k] > 0)
  const seats: Record<string, number> = {}
  partidos.forEach(p => { seats[p] = 0 })

  for (let i = 0; i < totalSeats; i++) {
    let maxQuotient = -1
    let winner = ''
    for (const p of partidos) {
      const quotient = votes[p] / (seats[p] + 1)
      if (quotient > maxQuotient) {
        maxQuotient = quotient
        winner = p
      }
    }
    if (winner) seats[winner]++
  }

  return Object.entries(seats)
    .map(([partidoId, escanos]) => ({ partidoId, escanos }))
    .filter(r => r.escanos > 0)
    .sort((a, b) => b.escanos - a.escanos)
}
