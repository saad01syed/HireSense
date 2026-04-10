import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getResumeAnalysis } from '../utils/resumeStorage'
import { matchResumeToJob } from '../utils/jobMatcher'
import styles from './JobDetailPage.module.css'

type DetailJob = {
  id: number
  title: string
  company: string
  location: string
  tags: string[]
  hybrid: string
  experienceLevel: string
  salaryRange: string
  type: string
  dateRange: string
  posted: string
  badge: string
  logo: string
  description: string
}

const jobs: DetailJob[] = [
  {
    id: 1,
    title: 'Software Engineer Intern',
    company: 'Google',
    location: 'Austin, TX',
    tags: ['Python', 'React', 'SQL', 'APIs', 'Git'],
    hybrid: 'Hybrid',
    experienceLevel: 'Internship',
    salaryRange: '$25-$35/hr',
    type: 'Internship',
    dateRange: 'Last 7 Days',
    posted: '2 days ago',
    badge: 'Top Match',
    logo: '',
    description:
      'Work on full-stack product features, scalable backend services, and internal tools. Collaborate with engineers, write production-ready code, and contribute to internal platform improvements.',
  },
  {
    id: 2,
    title: 'Data Analyst Intern',
    company: 'Microsoft',
    location: 'Irving, TX',
    tags: ['SQL', 'Excel', 'Python', 'Tableau', 'Analytics'],
    hybrid: 'Hybrid',
    experienceLevel: 'Internship',
    salaryRange: '$22-$30/hr',
    type: 'Internship',
    dateRange: 'Last 7 Days',
    posted: '1 day ago',
    badge: 'Trending',
    logo: '',
    description:
      'Analyze business data, build dashboards, and communicate insights to stakeholders. Support reporting, trend analysis, and data-backed decision making.',
  },
  {
    id: 3,
    title: 'Frontend Engineer Intern',
    company: 'Amazon',
    location: 'Dallas, TX',
    tags: ['React', 'TypeScript', 'CSS', 'JavaScript', 'Frontend'],
    hybrid: 'On-site',
    experienceLevel: 'Internship',
    salaryRange: '$24-$32/hr',
    type: 'Internship',
    dateRange: 'Last 14 Days',
    posted: '4 days ago',
    badge: 'Popular',
    logo: '',
    description:
      'Build responsive interfaces, improve performance, and collaborate with design and product teams. Focus on scalable UI systems and strong user experience.',
  },
  {
    id: 4,
    title: 'Machine Learning Intern',
    company: 'NVIDIA',
    location: 'Remote',
    tags: ['Python', 'Machine Learning', 'Pandas', 'APIs', 'Data'],
    hybrid: 'Remote',
    experienceLevel: 'Internship',
    salaryRange: '$28-$38/hr',
    type: 'Internship',
    dateRange: 'Last 30 Days',
    posted: '6 days ago',
    badge: 'AI Role',
    logo: '',
    description:
      'Support ML experimentation, model pipelines, and applied AI product features. Work with datasets, prototype models, and help productionize ML workflows.',
  },
]

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const savedResume = getResumeAnalysis()

  const job = useMemo(() => {
    const numericId = Number(id)
    return jobs.find((item) => item.id === numericId) ?? null
  }, [id])

  const matchResult = useMemo(() => {
    if (!job) {
      return null
    }

    return matchResumeToJob(savedResume?.parsed_data, job)
  }, [job, savedResume])

  if (!job) {
    return (
      <div className="page">
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          ← Back to Jobs
        </button>

        <div className={styles.emptyState}>Job not found.</div>
      </div>
    )
  }

  return (
    <div className="page">
      <button className={styles.backBtn} onClick={() => navigate('/')}>
        ← Back to Jobs
      </button>

      <div className={styles.layout}>
        <main className={styles.main}>
          <section className={styles.heroCard}>
            <div className={styles.heroTopRow}>
              <div>
                <div className={styles.company}>{job.company}</div>
                <h1 className={styles.jobTitle}>{job.title}</h1>
                <div className={styles.jobMeta}>
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>{job.hybrid}</span>
                  <span>•</span>
                  <span>{job.type}</span>
                  <span>•</span>
                  <span>{job.posted}</span>
                </div>
              </div>

              <div className={styles.badge}>{job.badge}</div>
            </div>
          </section>

          <section className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Role Overview</h2>
            <p className={styles.description}>{job.description}</p>
          </section>

          <section className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Key Skills</h2>
            <div className={styles.tagsWrap}>
              {job.tags.map((tag) => (
                <span key={tag} className={styles.skillTag}>
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Details</h2>
            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <div className={styles.detailLabel}>Experience</div>
                <div className={styles.detailValue}>{job.experienceLevel}</div>
              </div>
              <div className={styles.detailCard}>
                <div className={styles.detailLabel}>Compensation</div>
                <div className={styles.detailValue}>{job.salaryRange}</div>
              </div>
              <div className={styles.detailCard}>
                <div className={styles.detailLabel}>Job Type</div>
                <div className={styles.detailValue}>{job.type}</div>
              </div>
              <div className={styles.detailCard}>
                <div className={styles.detailLabel}>Posted</div>
                <div className={styles.detailValue}>{job.posted}</div>
              </div>
            </div>
          </section>
        </main>

        <aside className={styles.sidebar}>
          <div className={styles.matchCard}>
            <div className={styles.matchLabel}>Your Match Score</div>

            {!savedResume || !matchResult ? (
              <>
                <div className={styles.matchEmpty}>
                  Upload a resume to see your personalized match breakdown.
                </div>
                <Link
                  to="/resume"
                  className="btn-primary"
                  style={{ width: '100%', padding: '11px', justifyContent: 'center', marginTop: '14px' }}
                >
                  Upload Resume
                </Link>
              </>
            ) : (
              <>
                <div className={styles.scoreCircle}>
                  <span className={styles.scoreValue}>{matchResult.matchScore}%</span>
                </div>

                <div className={styles.matchSummary}>{matchResult.recommendation}</div>

                <div className={styles.matchSection}>
                  <div className={styles.matchSectionTitle}>Matched Skills</div>
                  {matchResult.matchedSkills.length > 0 ? (
                    <div className={styles.tagsWrap}>
                      {matchResult.matchedSkills.map((skill) => (
                        <span key={skill} className={styles.matchTagGood}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.matchEmpty}>No strong overlap found yet.</div>
                  )}
                </div>

                <div className={styles.matchSection}>
                  <div className={styles.matchSectionTitle}>Missing Skills</div>
                  {matchResult.missingSkills.length > 0 ? (
                    <div className={styles.tagsWrap}>
                      {matchResult.missingSkills.map((skill) => (
                        <span key={skill} className={styles.matchTagMissing}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.matchEmpty}>
                      You already cover the listed job skills.
                    </div>
                  )}
                </div>

                <button
                  className="btn-primary"
                  style={{ width: '100%', padding: '11px', justifyContent: 'center', marginTop: '14px' }}
                >
                  Apply Now
                </button>
                <button className="btn-outline" style={{ marginTop: '8px' }}>
                  Save Job
                </button>
              </>
            )}
          </div>

          <div className={styles.interviewCard}>
            <h3 className={styles.interviewTitle}>AI Interview Prep</h3>
            <div className={styles.interviewEmpty}>
              Interview questions will load once backend is connected.
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}