import styles from './MarketSidebar.module.css'
import { IconTrending } from './Icons'

// TODO: Replace with API data — GET /jobs/market-stats (TBD endpoint)

export default function MarketSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <IconTrending /> Market Overview
        </div>
        {/* TODO: Map over market stats from API */}
        <div className={styles.emptyState}>Stats loading once backend is connected.</div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Trending Skills</div>
        {/* TODO: Map over trending skills from API */}
        <div className={styles.emptyState}>Skills loading once backend is connected.</div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Top Locations</div>
        {/* TODO: Map over top DFW locations from API */}
        <div className={styles.emptyState}>Locations loading once backend is connected.</div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Top Companies</div>
        {/* TODO: Map over top companies from API */}
        <div className={styles.emptyState}>Companies loading once backend is connected.</div>
      </div>
    </aside>
  )
}
