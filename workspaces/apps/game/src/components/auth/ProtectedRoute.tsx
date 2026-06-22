import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

export function ProtectedRoute() {
  const { isAuthenticated, checkingSession } = useAuth()

  if (checkingSession) {
    return null
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />
}