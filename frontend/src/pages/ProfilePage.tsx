import { useNavigate } from 'react-router-dom'
import styles from './ProfilePage.module.css'
import { IconBriefcase, IconMap } from '../components/Icons'
import { mockSavedJobs, mockAppliedJobs } from '../data/mockData'
import { SavedJob, AppliedJob } from '../types'

// TODO: Replace with API calls — auth, saved/applied jobs from src/api/jobs

// Status badge helper
const statusLabel: Record<string, string> = {
  applied:      "Applied",
  interviewing: "Interview",
  offered:      "Offered",
  rejected:     "Rejected",
};

const statusStyle: Record<string, React.CSSProperties> = {
  applied:      { background: "#f0f4ff", color: "#3b5bdb" },
  interviewing: { background: "#e6f9f0", color: "#2f9e44" },
  offered:      { background: "#fff9db", color: "#e67700" },
  rejected:     { background: "#fff0f0", color: "#e03131" },
};

export default function ProfilePage() {
  const navigate = useNavigate()
  // TODO: savedJobs — fetch from GET /jobs/saved (auth required)
  // TODO: appliedJobs — fetch from GET /jobs/applied (auth required)
  const savedJobs: SavedJob[] = mockSavedJobs
  const appliedJobs: AppliedJob[] = mockAppliedJobs

  return (
    <div className="page">
      <div className={styles.layout}>

        {/* LEFT — Auth */}
        <aside className={styles.authCol}>
          <div className={styles.authCard}>
            <h2 className={styles.authTitle}>Sign Up</h2>
            <p className={styles.authSub}>Create your HireSense account.</p>
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input className={styles.input} type="text" placeholder="Jane Doe" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" placeholder="jane@email.com" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input className={styles.input} type="password" placeholder="••••••••" />
            </div>
            {/* TODO: onClick → POST /auth/signup */}
            <button className="btn-primary" style={{ width: '100%', padding: '11px', justifyContent: 'center', marginTop: '4px' }}>
              Create Account
            </button>
          </div>

          <div className={styles.authCard}>
            <h2 className={styles.authTitle}>Log In</h2>
            <p className={styles.authSub}>Welcome back.</p>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" placeholder="jane@email.com" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input className={styles.input} type="password" placeholder="••••••••" />
            </div>
            {/* TODO: onClick → POST /auth/login, store JWT token */}
            <button className="btn-primary" style={{ width: '100%', padding: '11px', justifyContent: 'center', marginTop: '4px' }}>
              Log In
            </button>
          </div>

          <div className={styles.authCard}>
            <h2 className={styles.authTitle}>Edit Account</h2>
            <p className={styles.authSub}>Update your profile details.</p>
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input className={styles.input} type="text" placeholder="Jane Doe" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" placeholder="jane@email.com" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>New Password</label>
              <input className={styles.input} type="password" placeholder="••••••••" />
            </div>
            {/* TODO: onClick → PATCH /auth/user (auth required) */}
            <button className="btn-outline" style={{ width: '100%', padding: '11px', textAlign: 'center', marginTop: '4px' }}>
              Save Changes
            </button>
          </div>
        </aside>

        {/* RIGHT — Saved & Applied Jobs */}
        <main className={styles.jobsCol}>
          <section className={styles.jobSection}>
            <h2 className={styles.sectionTitle}>Saved Jobs</h2>
            <div className={styles.jobScroll}>
              {savedJobs.length > 0 ? savedJobs.map((job) => (
                  <div 
                    key={job.id}
                    className={styles.jobRow}
                    onClick={() => navigate(`/jobs/${job.job_id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.jobLogo}>{job.logo}</div>
                    <div className={styles.jobInfo}>
                      <div className={styles.jobTitle}>{job.title}</div>
                      <div className={styles.jobMeta}>
                        <span><IconBriefcase /> {job.company}</span>
                        <span><IconMap /> {job.location}</span>
                      </div>
                      {job.tags.length > 0 && (
                      <div className={styles.tagRow}>
                        {job.tags.map(tag => (
                          <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                    </div>
                    <div className={styles.jobRight}>
                      <div className={styles.jobSalary}>{job.salary}</div>
                      <span className={styles.matchBadge}>{job.match}% match</span>
                    </div>
                  </div>
                ))
              )) : (
                <div className={styles.emptyState}>
                  {/* TODO: Show spinner while loading */}
                  No saved jobs yet. Save a job from the listings page.
                </div>
              )}
            </div>
          </section>

          <section className={styles.jobSection}>
            <h2 className={styles.sectionTitle}>Applied Jobs</h2>
            <div className={styles.jobScroll}>
              {appliedJobs.length > 0 ? appliedJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className={styles.jobRow}
                    onClick={() => navigate(`/jobs/${job.job_id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.jobLogo}>{job.logo}</div>
                    <div className={styles.jobInfo}>
                      <div className={styles.jobTitle}>{job.title}</div>
                      <div className={styles.jobMeta}>
                        <span><IconBriefcase /> {job.company}</span>
                        <span><IconMap /> {job.location}</span>
                      </div>
                      {job.tags.length > 0 && (
                      <div className={styles.tagRow}>
                        {job.tags.map(tag => (
                          <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                        </div>
                      )}
                      </div>
                    <div className={styles.jobRight}>
                      <div className={styles.jobSalary}>{job.salary}</div>
                      <span 
                        className={styles.appliedBadge}
                        style={statusStyle[job.status]}
                      >
                        {statusLabel[job.status]}
                      </span>
                      </span>
                    </div>
                  </div>
                ))
              )) : (
                <div className={styles.emptyState}>
                  No applied jobs yet.
                </div>
              )}
            </div>
          </section>
        </main>

      </div>
    </div>
  )
}
