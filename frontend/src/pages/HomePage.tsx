import { useMemo, useState } from 'react'
import JobCard from '../components/JobCard'
import MarketSidebar from '../components/MarketSidebar'
import FilterBar, { buildEmptyFilters, type FilterState } from '../components/FilterBar'
import { IconSearch } from '../components/Icons'
import { getResumeAnalysis } from '../utils/resumeStorage'
import { matchResumeToJob } from '../utils/jobMatcher'
import type { Job } from '../types'
import styles from './HomePage.module.css'

const jobs: Job[] = [
  {
    id: 1,
    title: 'Software Engineer Intern',
    company: 'Google',
    location: 'Austin, TX',
    tags: ['Python', 'React', 'SQL', 'APIs', 'Git'],
    hybrid: 'Hybrid',
    experienceLevel: 'Internship',
    salary: '$25-$35/hr',
    salaryRange: '$25-$35/hr',
    type: 'Internship',
    dateRange: 'Last 7 Days',
    posted: '2 days ago',
    badge: 'Top Match',
    match: 0,
    logo: '',
    description:
      'Work on full-stack product features, scalable backend services, and internal tools.',
  },
  {
    id: 2,
    title: 'Data Analyst Intern',
    company: 'Microsoft',
    location: 'Irving, TX',
    tags: ['SQL', 'Excel', 'Python', 'Tableau', 'Analytics'],
    hybrid: 'Hybrid',
    experienceLevel: 'Internship',
    salary: '$22-$30/hr',
    salaryRange: '$22-$30/hr',
    type: 'Internship',
    dateRange: 'Last 7 Days',
    posted: '1 day ago',
    badge: 'Trending',
    match: 0,
    logo: '',
    description:
      'Analyze business data, build dashboards, and communicate insights to stakeholders.',
  },
  {
    id: 3,
    title: 'Frontend Engineer Intern',
    company: 'Amazon',
    location: 'Dallas, TX',
    tags: ['React', 'TypeScript', 'CSS', 'JavaScript', 'Frontend'],
    hybrid: 'On-site',
    experienceLevel: 'Internship',
    salary: '$24-$32/hr',
    salaryRange: '$24-$32/hr',
    type: 'Internship',
    dateRange: 'Last 14 Days',
    posted: '4 days ago',
    badge: 'Popular',
    match: 0,
    logo: '',
    description:
      'Build responsive interfaces, improve performance, and collaborate with design and product teams.',
  },
  {
    id: 4,
    title: 'Machine Learning Intern',
    company: 'NVIDIA',
    location: 'Remote',
    tags: ['Python', 'Machine Learning', 'Pandas', 'APIs', 'Data'],
    hybrid: 'Remote',
    experienceLevel: 'Internship',
    salary: '$28-$38/hr',
    salaryRange: '$28-$38/hr',
    type: 'Internship',
    dateRange: 'Last 30 Days',
    posted: '6 days ago',
    badge: 'AI Role',
    match: 0,
    logo: '',
    description:
      'Support ML experimentation, model pipelines, and applied AI product features.',
  },
]

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>(buildEmptyFilters())

  const savedResume = getResumeAnalysis()

  const jobsWithMatch = useMemo(() => {
    return jobs.map((job) => {
      const matchResult = matchResumeToJob(savedResume?.parsed_data, job)

      return {
        ...job,
        match: matchResult.matchScore,
        matchDetails: matchResult,
      }
    })
  }, [savedResume])

  const filteredJobs = jobsWithMatch
    .filter((job) => {
      const q = query.toLowerCase()

      const matchesQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.tags.some((t: string) => t.toLowerCase().includes(q))

      const city = filters['city']
      const style = filters['style']
      const exp = filters['experience']
      const salary = filters['salary']
      const type = filters['type']
      const date = filters['date']

      const matchesCity =
        city.size === 0 || city.has(job.location?.split(',')[0]?.trim())
      const matchesStyle =
        style.size === 0 || style.has(job.hybrid)
      const matchesExp =
        exp.size === 0 || exp.has(job.experienceLevel ?? '')
      const matchesSalary =
        salary.size === 0 || salary.has(job.salaryRange ?? '')
      const matchesType =
        type.size === 0 || type.has(job.type)
      const matchesDate =
        date.size === 0 || date.has(job.dateRange ?? '')

      return (
        matchesQuery &&
        matchesCity &&
        matchesStyle &&
        matchesExp &&
        matchesSalary &&
        matchesType &&
        matchesDate
      )
    })
    .sort((a, b) => b.match - a.match)

  return (
    <div className="page">
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <h1 className={styles.heroTitle}>
              Find your next <span className={styles.heroAccent}>opportunity</span>.
            </h1>
            <p className={styles.heroSub}>
              Live tech roles across Dallas–Fort Worth, ranked against your resume so you
              can see where you already fit and where you still need to level up.
            </p>
          </div>

          <div className={styles.heroStatCard}>
            <div className={styles.heroStatLabel}>Resume Matching</div>
            <div className={styles.heroStatValue}>
              {savedResume ? `${filteredJobs.length} ranked jobs` : 'Ready to personalize'}
            </div>
            <div className={styles.heroStatSub}>
              {savedResume
                ? 'Your uploaded resume is actively being used across the app.'
                : 'Upload a resume to unlock personalized rankings and fit analysis.'}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.searchWrap}>
        <div className={styles.searchBar}>
          <IconSearch />
          <input
            type="text"
            placeholder="Search by title, skill, or company..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button className="btn-primary" style={{ height: '54px', minWidth: '128px' }}>
          Search Jobs
        </button>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={filteredJobs.length}
      />

      <div className={styles.layout}>
        <MarketSidebar />

        <section className={styles.jobsSection}>
          <div className={styles.jobsSectionHeader}>
            <div>
              <h2 className={styles.jobsTitle}>Top Matches</h2>
              <p className={styles.jobsSubtitle}>
                {savedResume
                  ? 'Sorted by how well your uploaded resume aligns with the role.'
                  : 'Upload a resume to personalize these matches.'}
              </p>
            </div>
          </div>

          <div className={styles.jobsList}>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <div className={styles.emptyState}>
                <p>
                  {jobsWithMatch.length === 0
                    ? 'No job listings yet. Check back soon.'
                    : 'No jobs matched your current search and filters.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}