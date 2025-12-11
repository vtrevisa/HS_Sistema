import { useUser } from '@/http/use-user'
import { Navigate, Outlet } from 'react-router-dom'

export function ProtectedRoute() {
 const { user, isLoading } = useUser()

 if (isLoading) return <p>Carregando....</p>

 if (!user) return <Navigate to="/" replace />

 return <Outlet />
}
