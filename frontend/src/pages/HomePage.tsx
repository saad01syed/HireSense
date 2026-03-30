import { useState } from 'react'
import JobCard from '../components/JobCard'
import MarketSidebar from '../components/MarketSidebar'
import FilterBar, { buildEmptyFilters, type FilterState } from '../components/FilterBar'
import { IconSearch } from '../components/Icons'
import styles from './HomePage.module.css'

// TODO: Replace with API call — import { fetchJobs } from '../api/jobs'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>(buildEmptyFilters())

  // TODO: Replace with useEffect fetching from GET /jobs passing filters + query as params
  const jobs: any[] = []

  const filteredJobs = jobs.filter((job) => {
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

    // TODO: These filter checks will map to backend query params once API is connected
    const matchesCity   = city.size === 0   || city.has(job.location?.split(',')[0]?.trim())
    const matchesStyle  = style.size === 0  || style.has(job.hybrid)
    const matchesExp    = exp.size === 0    || exp.has(job.experienceLevel)
    const matchesSalary = salary.size === 0 || salary.has(job.salaryRange)
    const matchesType   = type.size === 0   || type.has(job.type)
    const matchesDate   = date.size === 0   || date.has(job.dateRange)

    return matchesQuery && matchesCity && matchesStyle && matchesExp && matchesSalary && matchesType && matchesDate
  })

  return (
    <div className="page">
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Find your next <span className={styles.heroAccent}>opportunity</span>.
        </h1>
        <p className={styles.heroSub}>
          Live job listings across Dallas–Fort Worth, updated daily.
        </p>
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
        <button className="btn-primary" style={{ height: '50px' }}>
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

        <section>
          <div className={styles.jobsList}>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <div className={styles.emptyState}>
                {/* TODO: Show loading spinner while fetching */}
                <p>No job listings yet. Check back soon — the crawler runs daily.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
