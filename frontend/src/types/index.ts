export interface Job {
  id: number
  title: string
  company: string
  location: string
  type: string
  salary: string
  tags: string[]
  posted: string
  badge: string | null
  match: number
  logo: string
  hybrid: 'Remote' | 'Hybrid' | 'On-site'
  description?: string | JobDescription
  experienceLevel?: string
  salaryRange?: string
  dateRange?: string
  matchDetails?: {
    matchScore: number
    matchedSkills: string[]
    missingSkills: string[]
    recommendation: string
  }
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
