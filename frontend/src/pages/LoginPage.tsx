import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './LoginPage.module.css'

// Mock credentials for prototype week
const MOCK_EMAIL    = 'dev@hiresense.com'
const MOCK_PASSWORD = 'password123'

export default function LoginPage() {
  const navigate = useNavigate()
  const [isSignup, setIsSignup]   = useState(false)
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState('')

  const handleSubmit = () => {
    setError('')
    if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
      localStorage.setItem('mock_auth', 'true')
      navigate('/')
    } else {
      setError('Invalid email or password.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <div className={styles.logo}>HireSense</div>
        <h1 className={styles.title}>{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
        <p className={styles.sub}>
          {isSignup ? 'Sign up to get started.' : 'Log in to your HireSense account.'}
        </p>

        {isSignup && (
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input className={styles.input} type="text" placeholder="janedoe" />
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            placeholder="jane@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          className="btn-primary"
          style={{ width: '100%', padding: '11px', justifyContent: 'center', marginTop: '4px' }}
          onClick={handleSubmit}
        >
          {isSignup ? 'Create Account' : 'Log In'}
        </button>

        <p className={styles.toggle}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span onClick={() => { setIsSignup(!isSignup); setError('') }}>
            {isSignup ? 'Log In' : 'Sign Up'}
          </span>
        </p>

      </div>
    </div>
  )
}