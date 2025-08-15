import { useUser } from '@/http/use-user'
import { Navigate, Outlet } from 'react-router-dom'

export function ProtectedRoute() {
 const { data: authUser, isLoading } = useUser()

 if (isLoading) return <p>Carregando....</p>

 if (!authUser) return <Navigate to="/" replace />

 return <Outlet />
}
