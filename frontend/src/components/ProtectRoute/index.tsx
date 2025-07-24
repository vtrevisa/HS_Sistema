import { Navigate, Outlet } from 'react-router-dom'

export function ProtectedRoute() {
 const authUser = localStorage.getItem('auth_user')

 if (!authUser) {
  return <Navigate to="/" replace />
 }

 return <Outlet />
}
