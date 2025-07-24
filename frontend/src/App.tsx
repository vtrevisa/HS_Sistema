import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './contexts/ThemeContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './pages/app/login'
import { ProtectedRoute } from './components/ProtectRoute'
import { AppLayout } from './pages/_layouts/app'
import { Home } from './pages/app/home'
import { Leads } from './pages/app/leads'
import { Toaster } from 'sonner'

const queryClient = new QueryClient()

export function App() {
 return (
  <QueryClientProvider client={queryClient}>
   <ThemeProvider>
    <Toaster position="top-right" richColors />
    <BrowserRouter>
     <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<ProtectedRoute />}>
       <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Home />} />
        <Route path="/dashboard/leads" element={<Leads />} />
       </Route>
      </Route>
     </Routes>
    </BrowserRouter>
   </ThemeProvider>
  </QueryClientProvider>
 )
}
