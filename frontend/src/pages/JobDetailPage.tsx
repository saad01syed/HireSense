import { useParams, useNavigate } from 'react-router-dom'
import styles from './JobDetailPage.module.css'

// TODO: Replace with API call — import { fetchJob } from '../api/jobs'
// TODO: Replace with API call — import { fetchQuestions, submitAnswer } from '../api/interview'

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // TODO: useEffect — call fetchJob(id) on mount to populate job details
  // TODO: useEffect — call fetchQuestions(id) on mount to load interview questions
  // TODO: State for current question index and user's answer
  // TODO: On submit answer — call submitAnswer(id, answer) and display AI feedback

  return (
    <div className="page">
      <button className={styles.backBtn} onClick={() => navigate('/')}>
        ← Back to Jobs
      </button>

      <div className={styles.layout}>
        {/* LEFT — Job Detail */}
        <main className={styles.main}>
          {/* TODO: Populate with job data from GET /jobs/{id} */}
          <div className={styles.emptyState}>
            Loading job details from backend...
          </div>
        </main>

        {/* RIGHT — Match Score + AI Interview */}
        <aside className={styles.sidebar}>
          <div className={styles.matchCard}>
            {/* TODO: Show match score from resume analysis vs this job */}
            <div className={styles.matchLabel}>Your Match Score</div>
            <div className={styles.matchEmpty}>Upload a resume to see your match score.</div>
            <button className="btn-primary" style={{ width: '100%', padding: '11px', justifyContent: 'center', marginTop: '12px' }}>
              Apply Now
            </button>
            <button className="btn-outline" style={{ marginTop: '8px' }}>
              Save Job
            </button>
          </div>

          <div className={styles.interviewCard}>
            <h3 className={styles.interviewTitle}>AI Interview Prep</h3>
            {/* TODO: Show current question from fetchQuestions(id) */}
            {/* TODO: Textarea for user answer */}
            {/* TODO: Submit button → submitAnswer(id, answer) → display feedback */}
            <div className={styles.emptyState}>
              Interview questions will load once backend is connected.
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
