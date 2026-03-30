import { useNavigate } from 'react-router-dom'
import type { Job } from '../types'
import styles from './JobCard.module.css'
import { IconBriefcase, IconMap, IconClock, IconCheck } from './Icons'

interface Props {
  job: Job
}

export default function JobCard({ job }: Props) {
  const navigate = useNavigate()

  const hybridColor =
    job.hybrid === 'Remote'
      ? 'var(--green)'
      : job.hybrid === 'Hybrid'
      ? 'var(--accent)'
      : 'var(--text-secondary)'

  return (
    <div className={styles.card} onClick={() => navigate(`/jobs/${job.id}`)}>
      <div className={styles.logo}>{job.logo}</div>

      <div className={styles.main}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{job.title}</span>
          {job.badge && (
            <span className={`${styles.badge} ${styles[job.badge]}`}>
              {job.badge}
            </span>
          )}
        </div>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <IconBriefcase /> {job.company}
          </span>
          <span className={styles.metaItem}>
            <IconMap /> {job.location}
          </span>
          <span className={styles.metaItem}>
            <IconClock /> {job.posted}
          </span>
          <span className={styles.metaItem} style={{ color: hybridColor }}>
            {job.hybrid}
          </span>
        </div>

        <div className={styles.tags}>
          {job.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.salary}>{job.salary}</div>
        <div className={styles.type}>{job.type}</div>
        <div className={styles.matchBadge}>
          <IconCheck /> {job.match}% match
        </div>
      </div>
    </div>
  )
}
