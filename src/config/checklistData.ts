export interface ItemDef {
  label: string
  icon: string
}

export const SECURITY_ITEMS: ItemDef[] = [
  { label: 'Dotación de vigilantes (completa)',        icon: 'faUserShield' },
  { label: 'Rondas programadas completadas',           icon: 'faRoute' },
  { label: 'Control de accesos (puertas, barreras)',   icon: 'faDoorClosed' },
  { label: 'CCTV (visualización/rec)',                 icon: 'faVideo' },
  { label: 'Salidas de emergencia y pasillos libres',  icon: 'faWalking' },
  { label: 'Alarmas técnicas (incendio/inundación)',   icon: 'faFireExtinguisher' },
  { label: 'Puertas cortafuego cerradas',              icon: 'faBorderStyle' },
  { label: 'Iluminación de emergencia',                icon: 'faLightbulb' },
  { label: 'Control de llaves y salas técnicas',       icon: 'faKey' },
  { label: 'Incidentes con clientes/proveedores',      icon: 'faExclamationTriangle' },
]

export const CLEANING_ITEMS: ItemDef[] = [
  { label: 'Dotación presente (planificación)',        icon: 'faUsers' },
  { label: 'Zonas comunes – suelos secos/limpios',     icon: 'faBroom' },
  { label: 'Baños H – limpieza y consumibles',         icon: 'faRestroom' },
  { label: 'Baños M – limpieza y consumibles',         icon: 'faVenus' },
  { label: 'Baños PMR – limpieza y consumibles',       icon: 'faWheelchair' },
  { label: 'Zonas críticas – food court y parking',    icon: 'faUtensils' },
  { label: 'Escaleras mecánicas / Ascensores',         icon: 'faArrowsAltV' },
  { label: 'Cristales y accesos principales',          icon: 'faWindowMaximize' },
  { label: 'Gestión de residuos / papeleras',          icon: 'faTrashAlt' },
  { label: 'Olores / puntos de impacto',               icon: 'faWind' },
]

export const ROUNDS: string[] = [
  '08:00', '10:00', '12:00', '14:00',
  '16:00', '18:00', '20:00', '21:45',
]
