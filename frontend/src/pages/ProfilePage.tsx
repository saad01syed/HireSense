import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ProfilePage.module.css'
import { IconBriefcase, IconClock, IconMap } from '../components/Icons'
import { fetchJobs, fetchMarketInsights, type MarketInsightsResponse } from '../api/jobs'
import { getAuthSession, logout } from '../api/auth'
import { getResumeAnalysis } from '../utils/resumeStorage'
import { matchResumeToJob } from '../utils/jobMatcher'
import type { Job } from '../types'

function getTopSkills(skills: string[]) {
  return skills.slice(0, 6)
}

function getFocusAreas(jobs: Job[]) {
  const titles = jobs.map((job) => job.title.toLowerCase())

  const buckets = [
    { label: 'Software Engineering', score: titles.filter((t) => t.includes('engineer')).length },
    { label: 'Data / Analytics', score: titles.filter((t) => t.includes('data')).length },
    { label: 'Cloud / DevOps', score: titles.filter((t) => t.includes('cloud') || t.includes('devops')).length },
    { label: 'Internships', score: titles.filter((t) => t.includes('intern')).length },
  ]

  return buckets
    .sort((a, b) => b.score - a.score)
    .filter((item) => item.score > 0)
    .slice(0, 3)
}

function formatPosted(value?: string) {
  if (!value) return 'Recently posted'
  return value
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const authSession = getAuthSession()
  const savedResume = getResumeAnalysis()

  const [jobs, setJobs] = useState<Job[]>([])
  const [insights, setInsights] = useState<MarketInsightsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProfileData() {
      try {
        setIsLoading(true)
        const [jobsData, insightsData] = await Promise.all([fetchJobs(), fetchMarketInsights()])
        setJobs(jobsData)
        setInsights(insightsData)
      } catch (error) {
        console.error('Failed to load profile data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfileData()
  }, [])

  const rankedJobs = useMemo(() => {
    return jobs
      .map((job) => {
        const matchDetails = matchResumeToJob(savedResume?.parsed_data, job)
        return {
          ...job,
          match: matchDetails.matchScore,
          matchDetails,
        }
      })
      .sort((a, b) => b.match - a.match)
  }, [jobs, savedResume])

  const topMatches = rankedJobs.slice(0, 4)
  const totalMatchesAbove70 = rankedJobs.filter((job) => job.match >= 70).length
  const focusAreas = getFocusAreas(rankedJobs)
  const resumeSkills = getTopSkills(savedResume?.parsed_data.skills ?? [])

  const appliedLike = rankedJobs.filter((job) => job.match >= 75).slice(0, 3)
  const savedLike = rankedJobs.slice(3, 7)

  const handleLogout = async () => {
    await logout(authSession?.token)
    navigate('/login')
  }

  return (
    <div className="page">
      <div className={styles.layout}>
        <aside className={styles.leftRail}>
          <section className={styles.accountCard}>
            <div className={styles.cardEyebrow}>Account</div>
            <h2 className={styles.accountName}>
              {authSession?.user.username || 'HireSense User'}
            </h2>
            <div className={styles.accountEmail}>
              {authSession?.user.email || 'No active account'}
            </div>

            <div className={styles.accountDivider} />

            <div className={styles.accountMetaGrid}>
              <div className={styles.metaBlock}>
                <span className={styles.metaLabel}>Resume Status</span>
                <span className={styles.metaValue}>
                  {savedResume ? 'Active for matching' : 'Not uploaded'}
                </span>
              </div>
              <div className={styles.metaBlock}>
                <span className={styles.metaLabel}>Top Skill Themes</span>
                <span className={styles.metaValue}>
                  {resumeSkills.length > 0 ? resumeSkills.slice(0, 2).join(', ') : 'Pending'}
                </span>
              </div>
            </div>

            <button
              className="btn-outline"
              style={{ width: '100%', padding: '11px', justifyContent: 'center', marginTop: '16px' }}
              onClick={() => void handleLogout()}
            >
              Log Out
            </button>
          </section>

          <section className={styles.sideCard}>
            <div className={styles.cardEyebrow}>Search Signals</div>
            <div className={styles.sideCardTitle}>
              {savedResume ? 'Career dashboard live' : 'Upload your resume to unlock signals'}
            </div>
            <p className={styles.sideCardText}>
              {savedResume
                ? 'HireSense is using your uploaded resume and the live job feed to prioritize opportunities.'
                : 'Once your resume is uploaded, this dashboard will personalize markets, skills, and top roles.'}
            </p>

            {resumeSkills.length > 0 && (
              <div className={styles.skillChipWrap}>
                {resumeSkills.map((skill) => (
                  <span key={skill} className={styles.skillChip}>
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </section>
        </aside>

        <main className={styles.mainCol}>
          <section className={styles.statsSection}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{rankedJobs.length}</div>
                <div className={styles.statLabel}>Live Roles Ranked</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{totalMatchesAbove70}</div>
                <div className={styles.statLabel}>Strong Matches</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{savedResume?.analysis.score ?? '--'}</div>
                <div className={styles.statLabel}>Resume Score</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{insights?.top_locations?.[0]?.city ?? '—'}</div>
                <div className={styles.statLabel}>Best Market</div>
              </div>
            </div>
          </section>

          <section className={styles.dashboardSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Career Dashboard</h2>
                <p className={styles.sectionSub}>
                  Real-time view of your strongest opportunities, resume position, and live market direction.
                </p>
              </div>
            </div>

            <div className={styles.dashboardGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureLabel}>Best Focus Areas</div>
                <div className={styles.focusList}>
                  {focusAreas.length > 0 ? (
                    focusAreas.map((area) => (
                      <div key={area.label} className={styles.focusItem}>
                        <span className={styles.focusName}>{area.label}</span>
                        <span className={styles.focusValue}>{area.score}</span>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyMini}>Not enough live role data yet.</div>
                  )}
                </div>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureLabel}>Resume Positioning</div>
                <div className={styles.featureHeadline}>
                  {savedResume ? 'Your profile is ready for targeted applications.' : 'Upload a resume to unlock matching.'}
                </div>
                <p className={styles.featureText}>
                  {savedResume
                    ? savedResume.analysis.summary
                    : 'Resume analysis powers role ranking, top-skill themes, and personalized opportunity tracking.'}
                </p>
              </div>
            </div>
          </section>

          <section className={styles.jobSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Top Opportunities</h2>
                <p className={styles.sectionSub}>
                  Highest-ranked live roles based on your current resume and the job feed.
                </p>
              </div>
            </div>

            <div className={styles.jobList}>
              {isLoading ? (
                <div className={styles.emptyState}>Loading your top opportunities...</div>
              ) : topMatches.length > 0 ? (
                topMatches.map((job) => (
                  <div
                    key={job.id}
                    className={styles.jobRow}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <div className={styles.jobLogo}>{job.company?.charAt(0) || 'J'}</div>

                    <div className={styles.jobInfo}>
                      <div className={styles.jobTopRow}>
                        <div className={styles.jobTitle}>{job.title}</div>
                        <span className={styles.matchBadge}>{job.match}% match</span>
                      </div>

                      <div className={styles.jobMeta}>
                        <span><IconBriefcase /> {job.company}</span>
                        <span><IconMap /> {job.location}</span>
                        <span><IconClock /> {formatPosted(job.posted)}</span>
                      </div>

                      {job.matchDetails?.matchedSkills?.length ? (
                        <div className={styles.signalText}>
                          Strong overlap: {job.matchDetails.matchedSkills.slice(0, 3).join(', ')}
                        </div>
                      ) : (
                        <div className={styles.signalText}>Live role with active match scoring.</div>
                      )}
                    </div>

                    <div className={styles.jobRight}>
                      <div className={styles.jobSalary}>
                        {typeof job.salary === 'number' ? `$${job.salary.toLocaleString()}` : job.salary}
                      </div>
                      <div className={styles.jobType}>{job.type}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>No live opportunities available yet.</div>
              )}
            </div>
          </section>

          <div className={styles.twoColumnGrid}>
            <section className={styles.jobSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Watchlist</h2>
                  <p className={styles.sectionSub}>
                    Additional roles worth reviewing as you refine your applications.
                  </p>
                </div>
              </div>

              <div className={styles.compactList}>
                {savedLike.length > 0 ? (
                  savedLike.map((job) => (
                    <div
                      key={job.id}
                      className={styles.compactRow}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      <div>
                        <div className={styles.compactTitle}>{job.title}</div>
                        <div className={styles.compactMeta}>
                          {job.company} • {job.location}
                        </div>
                      </div>
                      <span className={styles.compactPill}>{job.match}%</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyMini}>No additional watchlist roles yet.</div>
                )}
              </div>
            </section>

            <section className={styles.jobSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Application Pipeline</h2>
                  <p className={styles.sectionSub}>
                    Suggested next applications based on your strongest current fit.
                  </p>
                </div>
              </div>

              <div className={styles.compactList}>
                {appliedLike.length > 0 ? (
                  appliedLike.map((job, index) => (
                    <div
                      key={job.id}
                      className={styles.compactRow}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      <div>
                        <div className={styles.compactTitle}>{job.title}</div>
                        <div className={styles.compactMeta}>
                          {index === 0 ? 'Priority target' : index === 1 ? 'High-confidence role' : 'Recommended next step'}
                        </div>
                      </div>
                      <span className={styles.stagePill}>
                        {index === 0 ? 'Target' : index === 1 ? 'Ready' : 'Explore'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyMini}>No pipeline recommendations yet.</div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}