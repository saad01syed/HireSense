import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo}>
          <img src="/logo.png" alt="HireSense" className={styles.logoImg} />
        </NavLink>
        <div className={styles.links}>
          <NavLink
            to="/resume"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            Upload Resume
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            Profile
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
