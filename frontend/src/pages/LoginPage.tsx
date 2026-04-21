import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, saveAuthSession, signup } from '../api/auth'
import styles from './LoginPage.module.css'

const DEMO_EMAIL = 'dev@hiresense.com'
const DEMO_PASSWORD = 'password123'

export default function LoginPage() {
  const navigate = useNavigate()

  const [isSignup, setIsSignup] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setError('')

    if (!email.trim() || !password.trim() || (isSignup && !username.trim())) {
      setError('Please fill in all required fields.')
      return
    }

    try {
      setIsSubmitting(true)

      if (isSignup) {
        await signup(username.trim(), email.trim(), password)
        navigate('/')
        return
      }

      const normalizedEmail = email.trim().toLowerCase()

      if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
        saveAuthSession({
          token: 'demo-session-token',
          user: {
            id: 0,
            username: 'Demo User',
            email: DEMO_EMAIL,
            joined_at: new Date().toISOString(),
          },
        })

        navigate('/')
        return
      }

      await login(email.trim(), password)
      navigate('/')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to continue right now.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>HireSense</div>
        <h1 className={styles.title}>{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
        <p className={styles.sub}>
          {isSignup
            ? 'Create your HireSense account to unlock job matching and resume insights.'
            : 'Log in to continue managing your resume, matches, and job search progress.'}
        </p>

        {!isSignup && (
          <div className={styles.demoHint}>
            Demo login: <strong>{DEMO_EMAIL}</strong> / <strong>{DEMO_PASSWORD}</strong>
          </div>
        )}

        {isSignup && (
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input
              className={styles.input}
              type="text"
              placeholder="anas"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleSubmit()}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          className="btn-primary"
          style={{ width: '100%', padding: '11px', justifyContent: 'center', marginTop: '4px' }}
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Working...' : isSignup ? 'Create Account' : 'Log In'}
        </button>

        <p className={styles.toggle}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            onClick={() => {
              setIsSignup(!isSignup)
              setError('')
            }}
          >
            {isSignup ? 'Log In' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  )
}