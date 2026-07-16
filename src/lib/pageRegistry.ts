import type { AstroComponentFactory } from 'astro/runtime/server/index.js'

import SuicideMortalityInequity from '@/components/suicide-mortality/SuicideMortalityInequity.astro'
import Analytics from '@/components/analytics/Analytics.astro'
import Welcome from '@/components/Welcome.astro'
import SuicideMortalitySDoH from '@/components/suicide-mortality/SuicideMortalitySDoH.astro'
import PrioritySelector from '@/components/PrioritySelector.astro'
import DSSIndicator from '@/components/indicators/DSSIndicator.astro'
import StratifiedIndicator from '@/components/indicators/StratifiedIndicator.astro'

import type {
  SuicideMortalityRateRow,
  ForestPlotDataRow,
  AnalyticsRow,
  ScatterRow,
  SimpleRow,
  StratifiedRow,
} from '@/lib/parquet'

export interface PageProps {
  title: string
  text: string
  dimension?: string
  subdimensions?: string[]
  pages: unknown[]
  slug: string | undefined
  date: Date
  source?: string
  data?: SuicideMortalityRateRow[]
  forestPlotData?: ForestPlotDataRow[]
  analyticsData?: AnalyticsRow[]
  scatterData?: ScatterRow[]
  aprobacionData?: SimpleRow[]
  reprobacionData?: SimpleRow[]
  coberturaBrutaData?: SimpleRow[]
  coberturaNetaData?: SimpleRow[]
  desercionData?: SimpleRow[]
  repitenciaData?: SimpleRow[]
  previsionSocialData?: StratifiedRow[]
}

type PropsResolver = (
  props: PageProps,
  baseUrl: string,
) => Record<string, unknown>

interface PageRegistryEntry {
  component: AstroComponentFactory
  resolveProps: PropsResolver
}

const base = (url: string, path: string) => `${url}/data/${path}`

export const pageRegistry: Record<string, PageRegistryEntry> = {
  // ─── No slug (home) ────────────────────────────────────────────────────────
  '': {
    component: Welcome,
    resolveProps: ({ text }) => ({ text }),
  },

  // ─── Section index pages ───────────────────────────────────────────────────
  'analisis-de-inequidad': {
    component: PrioritySelector,
    resolveProps: ({ title, text, slug }) => ({ title, text, section: slug }),
  },
  'determinantes-de-la-salud': {
    component: PrioritySelector,
    resolveProps: ({ title, text, slug }) => ({ title, text, section: slug }),
  },
  analisis: {
    component: PrioritySelector,
    resolveProps: ({ title, text, slug }) => ({ title, text, section: slug }),
  },

  // ─── Detail pages ──────────────────────────────────────────────────────────
  'determinantes-de-la-salud/mortalidad-por-suicidio': {
    component: SuicideMortalitySDoH,
    resolveProps: ({ title, text }) => ({ title, text }),
  },
  'analisis-de-inequidad/mortalidad-por-suicidio': {
    component: SuicideMortalityInequity,
    resolveProps: ({ title, text, data, source }, baseUrl) => ({
      title,
      text,
      data,
      source,
      csvPath: base(baseUrl, 'suicide_mortality.csv'),
    }),
  },
  'analisis/mortalidad-por-suicidio': {
    component: Analytics,
    resolveProps: (
      { title, text, forestPlotData, analyticsData, scatterData },
      baseUrl,
    ) => {
      return {
        title,
        text,
        forestPlotData,
        analyticsData,
        scatterData,
        csvUrl: base(baseUrl, 'suaza_scatter.csv'),
      }
    },
  },
  aprobacion: {
    component: DSSIndicator,
    resolveProps: (
      { title, text, dimension, subdimensions, aprobacionData, source },
      baseUrl,
    ) => ({
      title,
      text,
      dimension,
      source,
      subdimensions: subdimensions ?? [],
      data: aprobacionData ?? [],
      yAxisLabel: '%',
      csvPath: base(baseUrl, 'education_aprobacion.csv'),
    }),
  },
  reprobacion: {
    component: DSSIndicator,
    resolveProps: (
      { title, text, dimension, subdimensions, reprobacionData, source },
      baseUrl,
    ) => ({
      title,
      text,
      dimension,
      source,
      subdimensions: subdimensions ?? [],
      data: reprobacionData ?? [],
      yAxisLabel: '%',
      csvPath: base(baseUrl, 'education_reprobacion.csv'),
    }),
  },
  cobertura_bruta: {
    component: DSSIndicator,
    resolveProps: (
      { title, text, dimension, subdimensions, coberturaBrutaData, source },
      baseUrl,
    ) => ({
      title,
      text,
      dimension,
      source,
      subdimensions: subdimensions ?? [],
      data: coberturaBrutaData ?? [],
      yAxisLabel: '%',
      csvPath: base(baseUrl, 'education_cobertura_bruta.csv'),
    }),
  },
  cobertura_neta: {
    component: DSSIndicator,
    resolveProps: (
      { title, text, dimension, subdimensions, coberturaNetaData, source },
      baseUrl,
    ) => ({
      title,
      text,
      dimension,
      source,
      subdimensions: subdimensions ?? [],
      data: coberturaNetaData ?? [],
      yAxisLabel: '%',
      csvPath: base(baseUrl, 'education_cobertura_neta.csv'),
    }),
  },
  desercion: {
    component: DSSIndicator,
    resolveProps: (
      { title, text, dimension, subdimensions, desercionData, source },
      baseUrl,
    ) => ({
      title,
      text,
      dimension,
      source,
      subdimensions: subdimensions ?? [],
      data: desercionData ?? [],
      yAxisLabel: '%',
      csvPath: base(baseUrl, 'education_desercion.csv'),
    }),
  },
  repitencia: {
    component: DSSIndicator,
    resolveProps: (
      { title, text, dimension, subdimensions, repitenciaData, source },
      baseUrl,
    ) => ({
      title,
      text,
      dimension,
      source,
      subdimensions: subdimensions ?? [],
      data: repitenciaData ?? [],
      yAxisLabel: '%',
      csvPath: base(baseUrl, 'education_repitencia.csv'),
    }),
  },
  'prevision-social': {
    component: StratifiedIndicator,
    resolveProps: (
      { title, text, dimension, subdimensions, previsionSocialData, source },
      baseUrl,
    ) => ({
      title,
      text,
      dimension,
      source,
      subdimensions: subdimensions ?? [],
      data: previsionSocialData ?? [],
      stratifiers: ['regimen'],
      yAxisLabel: '%',
      csvPath: base(baseUrl, 'health_insurance.csv'),
    }),
  },
}
