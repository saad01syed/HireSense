import { useNavigate } from 'react-router-dom'
import type { Job } from '../types'
import styles from './JobCard.module.css'
import { IconBriefcase, IconMap, IconClock, IconCheck } from './Icons'
import { formatSalary } from '../utils/formatSalary'

interface Props {
  job: Job
}

function formatPosted(value?: string) {
  if (!value) return 'Recently posted'

  const trimmed = value.trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = new Date(`${trimmed}T00:00:00`)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
  }

  return trimmed
}

function getCardDescription(job: Job) {
  if (typeof job.description === 'string') {
    return job.description.trim()
  }

  if (job.description?.about) {
    return job.description.about.trim()
  }

  return ''
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
  const description = getCardDescription(job)
  const visibleTags = Array.isArray(job.tags) ? job.tags.slice(0, 5) : []
  const hiddenTagCount = Math.max(0, (job.tags?.length ?? 0) - visibleTags.length)
  const postedText = formatPosted(job.posted)
  const salaryText = formatSalary(job.salary ?? job.salaryRange)

  return (
    <article className={styles.card} onClick={() => navigate(`/jobs/${job.id}`)}>
      <div className={styles.logoWrap}>
        <div className={styles.logo}>{job.logo || job.company?.charAt(0) || '?'}</div>
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
                <IconClock /> {postedText}
              </span>
              <span className={`${styles.metaPill} ${hybridTone}`}>{job.hybrid}</span>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.salary}>{salaryText}</div>
            <div className={styles.type}>{job.type}</div>
          </div>
        </div>

        {description && <p className={styles.description}>{description}</p>}

        <div className={styles.bottomRow}>
          <div className={styles.tags}>
            {visibleTags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
            {hiddenTagCount > 0 && <span className={styles.moreTag}>+{hiddenTagCount}</span>}
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