import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = localStorage.getItem('mock_auth') === 'true'
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />
}