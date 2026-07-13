/**
 * Stratifier dimensions available for StratifiedLineChart.
 * Each indicator declares which ones apply to its data.
 */
export type IndicatorStratifier = 'zona' | 'etnia' | 'sexo' | 'grupo_edad'

export type IndicatorMeta = {
  slug: string
  title: string
  text: string
  description: string
  date: string
  dimension: string
  subdimensions: string[]
  priority: boolean
  /** Stratifier buttons shown in the chart (always includes implicit "total"). */
  stratifiers: IndicatorStratifier[]
  source: string
}

export const maternalMortalityIndicators: IndicatorMeta[] = [
  {
    slug: 'traslado',
    title:
      'Proporción de mujeres embarazadas que viven a más de una hora del centro de salud más cercano, por barrio',
    text: 'Permite identificar barreras territoriales de acceso a servicios que afectan la oportunidad y continuidad de la atención durante el embarazo.',
    description:
      'Permite identificar barreras territoriales de acceso a servicios que afectan la oportunidad y continuidad de la atención durante el embarazo.',
    date: '2026-04-10',
    dimension: 'dss',
    subdimensions: ['territorial'],
    priority: true,
    stratifiers: ['zona', 'etnia'],
    source:
      'Registros territoriales de acceso a servicios + mapas de localización de servicios y equipamiento urbano',
  },
  {
    slug: 'embarazadas-empleo-informal',
    title:
      'Proporción de personas con empleo informal o sin protección social, por barrio',
    text: 'Da cuenta de condiciones laborales que limitan el acceso a controles, licencias y apoyos durante el embarazo.',
    description:
      'Da cuenta de condiciones laborales que limitan el acceso a controles, licencias y apoyos durante el embarazo.',
    date: '2026-04-10',
    dimension: 'dss',
    subdimensions: ['empleo'],
    priority: true,
    stratifiers: ['zona', 'sexo'],
    source:
      'Encuesta nacional de hogares + encuesta local de condiciones de vida',
  },
  {
    slug: 'sobrecarga-embarazadas',
    title:
      'Proporción de mujeres embarazadas que presentan sobrecarga de cuidados (personas dependientes a cargo), por barrio',
    text: 'Permite monitorear desigualdades en la organización del cuidado que dificultan el acceso oportuno a servicios y apoyos.',
    description:
      'Permite monitorear desigualdades en la organización del cuidado que dificultan el acceso oportuno a servicios y apoyos.',
    date: '2026-04-10',
    dimension: 'dss',
    subdimensions: ['cuidados'],
    priority: true,
    stratifiers: ['zona', 'etnia'],
    source:
      'Encuesta local de condiciones de vida + registros sociales municipales',
  },
  {
    slug: 'apoyo-embarazadas',
    title:
      'Cobertura de programas municipales de apoyo social a mujeres embarazadas en barrios periféricos',
    text: 'Permite evaluar el alcance territorial de las políticas sociales dirigidas a mujeres embarazadas en contextos de mayor vulnerabilidad.',
    description:
      'Permite evaluar el alcance territorial de las políticas sociales dirigidas a mujeres embarazadas en contextos de mayor vulnerabilidad.',
    date: '2026-04-10',
    dimension: 'policy',
    subdimensions: ['programas sociales'],
    priority: true,
    stratifiers: ['zona'],
    source:
      'Base de datos del programa municipal de apoyo a mujeres embarazadas',
  },
  {
    slug: 'frecuencia-transporte',
    title:
      'Cobertura del transporte público subsidiado hacia centros de salud desde barrios periféricos',
    text: 'Da cuenta de la adecuación de las políticas de transporte a las necesidades de acceso a servicios de salud materna.',
    description:
      'Da cuenta de la adecuación de las políticas de transporte a las necesidades de acceso a servicios de salud materna.',
    date: '2026-04-10',
    dimension: 'policy',
    subdimensions: ['transporte'],
    priority: true,
    stratifiers: ['zona', 'etnia'],
    source:
      'Registros del sector transporte sobre recorridos, frecuencias y horarios',
  },
  {
    slug: 'apoyo-infantil',
    title:
      'Cobertura del programa municipal de apoyo al cuidado infantil “Cuidar en Comunidad” en mujeres embarazadas que residen en barrios periféricos del Municipio de San Martín del Valle',
    text: 'Permite monitorear el acceso efectivo a apoyos de cuidado que reducen la sobrecarga y facilitan el acceso a servicios durante el embarazo.',
    description:
      'Permite monitorear el acceso efectivo a apoyos de cuidado que reducen la sobrecarga y facilitan el acceso a servicios durante el embarazo.',
    date: '2026-05-10',
    dimension: 'policy',
    subdimensions: ['programas sociales'],
    priority: true,
    stratifiers: ['zona', 'etnia'],
    source:
      'Registros administrativos del sistema municipal de cuidados / Programa “Cuidar en Comunidad”',
  },
]
