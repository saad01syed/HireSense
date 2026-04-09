import { useNavigate } from 'react-router-dom'
import type { Job } from '../types'
import styles from './JobCard.module.css'
import { IconBriefcase, IconMap, IconClock, IconCheck } from './Icons'

interface Props {
  job: Job
}

export default function JobCard({ job }: Props) {
  const navigate = useNavigate()

  const hybridTone =
    job.hybrid === 'Remote'
      ? styles.remote
      : job.hybrid === 'Hybrid'
      ? styles.hybrid
      : styles.onsite

  const badgeText = job.badge ? job.badge.toUpperCase() : null

  return (
    <article className={styles.card} onClick={() => navigate(`/jobs/${job.id}`)}>
      <div className={styles.logoWrap}>
        <div className={styles.logo}>{job.logo || job.company.charAt(0)}</div>
      </div>

      <div className={styles.main}>
        <div className={styles.topRow}>
          <div className={styles.titleBlock}>
            <div className={styles.titleRow}>
              <h3 className={styles.title}>{job.title}</h3>
              {badgeText && <span className={styles.badge}>{badgeText}</span>}
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
              <span className={`${styles.metaPill} ${hybridTone}`}>{job.hybrid}</span>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.salary}>{job.salary}</div>
            <div className={styles.type}>{job.type}</div>
          </div>
        </div>

        {typeof job.description === 'string' && job.description && (
          <p className={styles.description}>{job.description}</p>
        )}

        <div className={styles.bottomRow}>
          <div className={styles.tags}>
            {job.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>

          <div className={styles.matchWrap}>
            <div className={styles.matchBadge}>
              <IconCheck /> {job.match}% match
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}