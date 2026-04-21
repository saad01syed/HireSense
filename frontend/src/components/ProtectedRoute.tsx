import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../api/auth'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}