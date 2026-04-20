import type { MarketInsightsResponse } from '../api/jobs'
import { IconTrending } from './Icons'
import styles from './MarketSidebar.module.css'

interface Props {
  insights: MarketInsightsResponse | null
  isLoading?: boolean
}

export default function MarketSidebar({ insights, isLoading = false }: Props) {
  if (isLoading) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <IconTrending /> Market Overview
          </div>
          <div className={styles.muted}>Loading insights...</div>
        </div>
      </aside>
    )
  }

  if (!insights) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <IconTrending /> Market Overview
          </div>
          <div className={styles.muted}>Insights unavailable right now.</div>
        </div>
      </aside>
    )
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <IconTrending /> Market Overview
        </div>
        <div className={styles.statValue}>{insights.overview.total_jobs}</div>
        <div className={styles.statLabel}>active roles in the current feed</div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Work Style Split</div>
        <div className={styles.list}>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Remote</span>
            <span className={styles.rowValue}>{insights.overview.remote_jobs}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Hybrid</span>
            <span className={styles.rowValue}>{insights.overview.hybrid_jobs}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>On-site</span>
            <span className={styles.rowValue}>{insights.overview.onsite_jobs}</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Trending Skills</div>
        <div className={styles.list}>
          {insights.trending_skills.length > 0 ? (
            insights.trending_skills.map((skill) => (
              <div key={skill.name} className={styles.row}>
                <span className={styles.skillPill}>{skill.name}</span>
                <span className={styles.rowValue}>{skill.count}</span>
              </div>
            ))
          ) : (
            <div className={styles.muted}>No skills available yet.</div>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Top Locations</div>
        <div className={styles.list}>
          {insights.top_locations.length > 0 ? (
            insights.top_locations.map((location) => (
              <div key={location.city} className={styles.row}>
                <span className={styles.rowLabel}>{location.city}</span>
                <span className={styles.rowValue}>{location.count}</span>
              </div>
            ))
          ) : (
            <div className={styles.muted}>No locations available yet.</div>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Top Companies</div>
        <div className={styles.list}>
          {insights.top_companies.length > 0 ? (
            insights.top_companies.map((company) => (
              <div key={company.name} className={styles.row}>
                <span className={styles.rowLabel}>{company.name}</span>
                <span className={styles.rowValue}>{company.count}</span>
              </div>
            ))
          ) : (
            <div className={styles.muted}>No companies available yet.</div>
          )}
        </div>
      </div>
    </aside>
  )
}