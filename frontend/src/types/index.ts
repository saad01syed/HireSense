export interface Job {
  id: number
  title: string
  company: string
  location: string
  type: string
  salary: string
  tags: string[]
  posted: string
  badge: 'new' | 'hot' | null
  match: number
  logo: string
  hybrid: 'Remote' | 'Hybrid' | 'On-site'
  description?: JobDescription
}

export interface JobDescription {
  about: string
  responsibilities: string[]
  requirements: string[]
  benefits: string[]
}

export interface MarketStat {
  label: string
  value: string
  highlight?: boolean
}

export interface SkillTrend {
  name: string
  type: 'hot' | 'rising' | 'normal'
}

export interface LocationStat {
  city: string
  count: number
  pct: number
}

export interface CompanyStat {
  name: string
  openRoles: number
}

export interface ResumeSkill {
  name: string
  score: number
  color: string
}

export interface ResumeInsight {
  type: 'pos' | 'neg' | 'tip'
  text: string
}

export interface FilterOption {
  label: string
  value: string
}
