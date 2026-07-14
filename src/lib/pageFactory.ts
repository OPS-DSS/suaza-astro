import {
  readParquet,
  dataPath,
  filterSuicideMortalityRateRows,
  filterForestPlotRows,
  filterAnalyticsSuicideRows,
  filterScatterSuicideRows,
  filterSimpleRows,
} from './parquet'
import { suicideMortalityIndicators } from '@/lib/indicators'
import type { IndicatorStratifier } from '@/lib/indicators'
import { priorities } from '@/lib/priority'
import type { PriorityMeta } from '@/lib/priority'

import type {
  SuicideMortalityRateRawRow,
  SuicideMortalityRateRow,
  ForestPlotRawRow,
  ForestPlotDataRow,
  AnalyticsSuicideRawRow,
  AnalyticsSuicideRow,
  ScatterSuicideRawRow,
  ScatterSuicideRow,
  SimpleRow,
  SimpleRawRow,
} from './parquet'

// ─── Loaded datasets ─────────────────────────────────────────────────────────

export interface PageDatasets {
  forestPlotData: ForestPlotDataRow[]
  analyticsSuicideData: AnalyticsSuicideRow[]
  scatterSuicideData: ScatterSuicideRow[]
  suicideMortalityRateData: SuicideMortalityRateRow[]
  aprobacionData: SimpleRow[]
  reprobacionData: SimpleRow[]
}

export async function loadAllDatasets(): Promise<PageDatasets> {
  let forestPlotData: ForestPlotDataRow[] = []
  try {
    const rows = await readParquet<ForestPlotRawRow>(
      dataPath('mock_forest_plot.parquet'),
    )
    forestPlotData = filterForestPlotRows(rows)
  } catch (e) {
    console.error('[loadAllDatasets] mock_forest_plot:', e)
  }

  let analyticsSuicideData: AnalyticsSuicideRow[] = []
  try {
    const rows = await readParquet<AnalyticsSuicideRawRow>(
      dataPath('mock_analytics_maternal.parquet'),
    )
    analyticsSuicideData = filterAnalyticsSuicideRows(rows)
  } catch (e) {
    console.error('[loadAllDatasets] mock_analytics_maternal:', e)
  }

  let scatterSuicideData: ScatterSuicideRow[] = []
  try {
    const rows = await readParquet<ScatterSuicideRawRow>(
      dataPath('mock_scatter_maternal.parquet'),
    )
    scatterSuicideData = filterScatterSuicideRows(rows)
  } catch (e) {
    console.error('[loadAllDatasets] mock_scatter_maternal:', e)
  }

  let suicideMortalityRateData: SuicideMortalityRateRow[] = []
  try {
    const rows = await readParquet<SuicideMortalityRateRawRow>(
      dataPath('suicide_mortality.parquet'),
    )
    suicideMortalityRateData = filterSuicideMortalityRateRows(rows)
  } catch (e) {
    console.error('[loadAllDatasets] suicide_mortality:', e)
  }

  let aprobacionData: SimpleRow[] = []
  try {
    const rows = await readParquet<SimpleRawRow>(
      dataPath('education_aprobacion.parquet'),
    )
    aprobacionData = filterSimpleRows(rows)
  } catch (e) {
    console.error('[loadAllDatasets] aprobacion:', e)
  }

  let reprobacionData: SimpleRow[] = []
  try {
    const rows = await readParquet<SimpleRawRow>(
      dataPath('education_reprobacion.parquet'),
    )
    reprobacionData = filterSimpleRows(rows)
  } catch (e) {
    console.error('[loadAllDatasets] reprobacion:', e)
  }

  return {
    forestPlotData,
    analyticsSuicideData,
    scatterSuicideData,
    suicideMortalityRateData,
    aprobacionData,
    reprobacionData,
  }
}

// ─── Page definitions ─────────────────────────────────────────────────────────

export interface PageDefinition {
  slug: string | undefined
  title: string
  text: string
  date: string
  navbar: boolean
  source?: string
  data?: SuicideMortalityRateRow[]
  forestPlotData?: ForestPlotDataRow[]
  analyticsSuicideData?: AnalyticsSuicideRow[]
  scatterSuicideData?: ScatterSuicideRow[]
  dimension?: string
  subdimensions?: string[]
  description?: string
  category?: string
  priority?: boolean
  stratifiers?: IndicatorStratifier[]
  aprobacionData?: SimpleRow[]
  reprobacionData?: SimpleRow[]
}

export function buildPages(datasets: PageDatasets): PageDefinition[] {
  const staticPages: PageDefinition[] = [
    {
      slug: undefined,
      title: 'Inicio',
      text: 'Bienvenidos al Observatorio de Determinantes Sociales de la Salud, un espacio dedicado a la recopilación, análisis y visualización de datos relacionados con la salud. Nuestro objetivo es proporcionar información precisa y actualizada para apoyar la toma de decisiones informadas en el ámbito de la salud pública.',
      date: '2026-01-01',
      navbar: true,
    },
    {
      slug: 'analisis-de-inequidad',
      title: 'Análisis de Inequidad',
      text: 'Problemas, gráficos de tendencias y mediciones de brechas',
      date: '2026-01-01',
      navbar: true,
    },
    {
      slug: 'determinantes-de-la-salud',
      title: 'Determinantes Sociales de la Salud',
      text: 'Factores que influyen en la salud de la población',
      date: '2026-01-01',
      navbar: true,
    },
    {
      slug: 'analisis',
      title: 'Análisis Avanzado',
      text: 'Análisis de relaciones',
      date: '2026-01-01',
      navbar: true,
    },
    {
      slug: 'analisis/mortalidad-por-suicidio',
      title: 'Análisis de Mortalidad por Suicidio',
      text: 'Análisis de relaciones',
      description: 'Indicadores de análisis de datos y visualización.',
      date: '2026-01-01',
      category: 'Tendencia',
      navbar: false,
      priority: false,
      forestPlotData: datasets.forestPlotData,
      analyticsSuicideData: datasets.analyticsSuicideData,
      scatterSuicideData: datasets.scatterSuicideData,
    },
  ]

  const priorityPages: PageDefinition[] = priorities.flatMap(
    (priority: PriorityMeta) => [
      {
        slug: `analisis-de-inequidad/${priority.slug}`,
        title: priority.title,
        text: priority.description,
        date: priority.date,
        category: priority.category,
        source: priority.source,
        navbar: false,
        data: datasets.suicideMortalityRateData,
      },
      {
        slug: `determinantes-de-la-salud/${priority.slug}`,
        title: priority.title,
        text: priority.description,
        date: priority.date,
        source: priority.source,
        category: priority.category,
        navbar: false,
      },
    ],
  )

  const indicatorPages: PageDefinition[] = suicideMortalityIndicators.map(
    (ind) => ({
      slug: ind.slug,
      title: ind.title,
      text: ind.text,
      dimension: ind.dimension,
      subdimensions: ind.subdimensions,
      date: ind.date,
      navbar: false,
      source: ind.source,
      ...(ind.slug === 'aprobacion'
        ? { aprobacionData: datasets.aprobacionData }
        : {}),
      ...(ind.slug === 'reprobacion'
        ? { reprobacionData: datasets.reprobacionData }
        : {}),
    }),
  )

  return [...staticPages, ...indicatorPages, ...priorityPages]
}

// ─── Static path factory ──────────────────────────────────────────────────────

export async function buildStaticPaths() {
  const datasets = await loadAllDatasets()
  const pages = buildPages(datasets)

  return pages.map(({ slug, title, text, date, navbar, source, ...rest }) => ({
    params: { slug },
    props: {
      title,
      text,
      slug,
      date: new Date(date),
      navbar,
      source,
      pages,
      ...rest,
    },
  }))
}
