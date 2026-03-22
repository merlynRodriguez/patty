export interface CandidatoAlcalde {
  id: string
  nombre: string
  partidoId: string
}

export interface CandidatoConcejo {
  id: string
  partidoId: string
  nombre: string
  jerarquia: string
}

export const CANDIDATOS_ALCALDE: CandidatoAlcalde[] = [
  { id: 'P01-A', nombre: 'Omar Ledezma',       partidoId: 'P01' },
  { id: 'P02-A', nombre: 'Milton Paichucama',  partidoId: 'P02' },
  { id: 'P03-A', nombre: 'Jesus Hinojosa',     partidoId: 'P03' },
  { id: 'P04-A', nombre: 'Roxama Moscoso',     partidoId: 'P04' },
  { id: 'P05-A', nombre: 'Edwin Lopez',        partidoId: 'P05' },
  { id: 'P06-A', nombre: 'Omar Amaya',         partidoId: 'P06' },
  { id: 'P07-A', nombre: 'Victor Carvajal',    partidoId: 'P07' },
  { id: 'P08-A', nombre: 'Gualberto Mercado',  partidoId: 'P08' },
  { id: 'P09-A', nombre: 'Felix Quispe',       partidoId: 'P09' },
  { id: 'P10-A', nombre: 'Alfredo Lucana',     partidoId: 'P10' },
  { id: 'P11-A', nombre: 'Patricia Arce',      partidoId: 'P11' },
]

export const CANDIDATOS_CONCEJO: CandidatoConcejo[] = [
  { id: 'P01-C01', partidoId: 'P01', nombre: 'JIMMY HERBAS LAGUNA',               jerarquia: 'C01' },
  { id: 'P01-C02', partidoId: 'P01', nombre: 'INGRID VANESSA ORTUÑO RAMIREZ',     jerarquia: 'C02' },
  { id: 'P01-C03', partidoId: 'P01', nombre: 'ONZALO ROJAS RODRIGUEZ',            jerarquia: 'C03' },
  { id: 'P01-C04', partidoId: 'P01', nombre: 'ROSA VILLANUEVA MORALES',           jerarquia: 'C04' },
  { id: 'P02-C01', partidoId: 'P02', nombre: 'MARIA TERESA BARRIONUEVO CORRALES', jerarquia: 'C01' },
  { id: 'P02-C02', partidoId: 'P02', nombre: 'RICHARD CONDORI BAUTISTA',          jerarquia: 'C02' },
  { id: 'P02-C03', partidoId: 'P02', nombre: 'EUGENIA CONDORI MAMANI',            jerarquia: 'C03' },
  { id: 'P02-C04', partidoId: 'P02', nombre: 'ADRIAN JAVIER GALARZA CHOQUE',      jerarquia: 'C04' },
  { id: 'P03-C01', partidoId: 'P03', nombre: 'JHESSICA COLQUE FORONDA',           jerarquia: 'C01' },
  { id: 'P03-C02', partidoId: 'P03', nombre: 'WILBER ROCHA RIOS',                 jerarquia: 'C02' },
  { id: 'P03-C03', partidoId: 'P03', nombre: 'COPERTINA GABRIEL CESPEDES',        jerarquia: 'C03' },
  { id: 'P03-C04', partidoId: 'P03', nombre: 'ROBERTO FERNANDEZ MALDONADO',       jerarquia: 'C04' },
  { id: 'P04-C01', partidoId: 'P04', nombre: 'VILMA JIMENEZ VEGAMONTE',           jerarquia: 'C01' },
  { id: 'P04-C02', partidoId: 'P04', nombre: 'DIEGO DURAN AGUILAR',               jerarquia: 'C02' },
  { id: 'P04-C03', partidoId: 'P04', nombre: 'MARIAT LITZI VELASCO CACERES',      jerarquia: 'C03' },
  { id: 'P04-C04', partidoId: 'P04', nombre: 'ALBERTO MALDONADO RIOS',            jerarquia: 'C04' },
  { id: 'P05-C01', partidoId: 'P05', nombre: 'JHANET CAMPERO SEJAS',              jerarquia: 'C01' },
  { id: 'P05-C02', partidoId: 'P05', nombre: 'ABRAHAM MAMANI BEDOYA',             jerarquia: 'C02' },
  { id: 'P05-C03', partidoId: 'P05', nombre: 'ROXANA MAMANI INCA',                jerarquia: 'C03' },
  { id: 'P05-C04', partidoId: 'P05', nombre: 'JUAN JOSE PINTO REYES',             jerarquia: 'C04' },
  { id: 'P06-C01', partidoId: 'P06', nombre: 'ESTHER ESPERANZA ROCHA CARTAGENA',  jerarquia: 'C01' },
  { id: 'P06-C02', partidoId: 'P06', nombre: 'ARIEL DANNY JIMENEZ FUENTES',       jerarquia: 'C02' },
  { id: 'P06-C03', partidoId: 'P06', nombre: 'PAMELA VILLEGAS MONTAÑO',           jerarquia: 'C03' },
  { id: 'P06-C04', partidoId: 'P06', nombre: 'ENOC BRAYAN WAYAR FUENTES',         jerarquia: 'C04' },
  { id: 'P07-C01', partidoId: 'P07', nombre: 'WENDY DANITZA CONDORI QUISPE',      jerarquia: 'C01' },
  { id: 'P07-C02', partidoId: 'P07', nombre: 'TEOFILO SANCHEZ CRUZ',              jerarquia: 'C02' },
  { id: 'P07-C03', partidoId: 'P07', nombre: 'MONICA JHASMIN CANEDO',             jerarquia: 'C03' },
  { id: 'P07-C04', partidoId: 'P07', nombre: 'ARMANDO ALFREDO VEIZAGA ADRIAZOLA', jerarquia: 'C04' },
  { id: 'P08-C01', partidoId: 'P08', nombre: 'CINTHIA VARGAS MARTINEZ',           jerarquia: 'C01' },
  { id: 'P08-C02', partidoId: 'P08', nombre: 'AURELIO VICENTE BAEZ PEREZ',        jerarquia: 'C02' },
  { id: 'P08-C03', partidoId: 'P08', nombre: 'MARIA VERONICA ZENTENO SARAVIA',    jerarquia: 'C03' },
  { id: 'P08-C04', partidoId: 'P08', nombre: 'BEIMAR VIDAURRE FLORES',            jerarquia: 'C04' },
  { id: 'P09-C01', partidoId: 'P09', nombre: 'MARLENE TAPIA VARGAS',              jerarquia: 'C01' },
  { id: 'P09-C02', partidoId: 'P09', nombre: 'MILTON ROBERT TORRICO FERRUFINO',   jerarquia: 'C02' },
  { id: 'P09-C03', partidoId: 'P09', nombre: 'SUGRA ELIZABETH MARTINEZ YAPURA',   jerarquia: 'C03' },
  { id: 'P09-C04', partidoId: 'P09', nombre: 'KARY LEDEZMA OVANDO',               jerarquia: 'C04' },
  { id: 'P10-C01', partidoId: 'P10', nombre: 'GIASMANI IVAN MIRANDA ARGOTE',      jerarquia: 'C01' },
  { id: 'P10-C02', partidoId: 'P10', nombre: 'MARIA ELENA ESPINOZA CHARRO',       jerarquia: 'C02' },
  { id: 'P10-C03', partidoId: 'P10', nombre: 'BASILIO RAMOS CHOQUE',              jerarquia: 'C03' },
  { id: 'P10-C04', partidoId: 'P10', nombre: 'JHENNY CRUZ TARIFA',                jerarquia: 'C04' },
  { id: 'P11-C01', partidoId: 'P11', nombre: 'PATRICIO PORTILLO VELIZ',           jerarquia: 'C01' },
  { id: 'P11-C02', partidoId: 'P11', nombre: 'ELIZABETH ANCALLE PANIAGUA',        jerarquia: 'C02' },
  { id: 'P11-C03', partidoId: 'P11', nombre: 'TEODORO QUISPE OTALORA',            jerarquia: 'C03' },
  { id: 'P11-C04', partidoId: 'P11', nombre: 'ROCIO AGUILAR ALAVE',               jerarquia: 'C04' },
]

export const CANDIDATO_ALCALDE_MAP: Record<string, CandidatoAlcalde> = Object.fromEntries(
  CANDIDATOS_ALCALDE.map(c => [c.partidoId, c])
)
