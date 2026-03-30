import type {
  MarketStat,
  SkillTrend,
  LocationStat,
  CompanyStat,
  ResumeSkill,
  ResumeInsight,
  FilterOption,
} from '../types'

// TODO: Remove this file once backend API is connected.
// All data will be replaced by calls in src/api/

export const JOBS = []

export const MARKET_STATS: MarketStat[] = []
export const TRENDING_SKILLS: SkillTrend[] = []
export const TOP_LOCATIONS: LocationStat[] = []
export const TOP_COMPANIES: CompanyStat[] = []
export const RESUME_SKILLS: ResumeSkill[] = []
export const RESUME_INSIGHTS: ResumeInsight[] = []
export const INTERVIEW_QUESTIONS: string[] = []

export const FILTER_OPTIONS: FilterOption[] = [
  { label: 'All Jobs', value: 'all' },
  { label: 'Remote', value: 'remote' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'On-site', value: 'onsite' },
  { label: '$100k+', value: '100k' },
  { label: '$130k+', value: '130k' },
  { label: 'Posted Today', value: 'today' },
  { label: 'Engineering', value: 'engineering' },
]
