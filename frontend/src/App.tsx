import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './contexts/ThemeContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectRoute'

import { AppLayout } from './pages/_layouts/app'
import { Login } from './pages/app/login'
import { Home } from './pages/app/home'
import { Alvaras } from './pages/app/captacao-alvaras'
import { Empresas } from './pages/app/busca-dados'
import { Leads } from './pages/app/gestao-leads'

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
        <Route path="/dashboard/captacao-alvaras" element={<Alvaras />} />
        <Route path="/dashboard/busca-empresa" element={<Empresas />} />
        <Route path="/dashboard/gestao-leads" element={<Leads />} />
       </Route>
      </Route>
     </Routes>
    </BrowserRouter>
   </ThemeProvider>
  </QueryClientProvider>
 )
}
