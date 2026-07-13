export const ANALYTICS_INDICATORS = {
  traslado: {
    label: 'Tiempo de traslado (>1h al CS)',
    title:
      'Proporción de mujeres embarazadas que viven a más de una hora del centro de salud más cercano, por barrio',
    axisLabel: '% mujeres embarazadas',
    color: '#6366f1',
  },
  empleo_informal: {
    label: 'Empleo informal',
    title:
      'Proporción de personas con empleo informal o sin protección social, por barrio',
    axisLabel: '% personas con empleo informal',
    color: '#8b5cf6',
  },
  sobrecarga: {
    label: 'Sobrecarga de cuidados',
    title:
      'Proporción de mujeres embarazadas que presentan sobrecarga de cuidados (personas dependientes a cargo), por barrio',
    axisLabel: '% mujeres embarazadas',
    color: '#f59e0b',
  },
  cobertura_programa: {
    label: 'Cobertura programa social',
    title:
      'Cobertura de programas municipales de apoyo social a mujeres embarazadas en barrios periféricos',
    axisLabel: '% mujeres embarazadas',
    color: '#10b981',
  },
  transporte: {
    label: 'Transporte subsidiado',
    title:
      'Cobertura del transporte público subsidiado hacia centros de salud desde barrios periféricos',
    axisLabel: '% población con acceso',
    color: '#3b82f6',
  },
  cuidar_comunidad: {
    label: 'Cuidar en Comunidad',
    title:
      'Cobertura del programa municipal de apoyo al cuidado infantil “Cuidar en Comunidad” en mujeres embarazadas que residen en barrios periféricos del Municipio de San Martín del Valle',
    axisLabel: '% mujeres embarazadas',
    color: '#ec4899',
  },
} as const

export type AnalyticsIndicatorKey = keyof typeof ANALYTICS_INDICATORS
