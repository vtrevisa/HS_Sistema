import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './contexts/ThemeContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectRoute'

import { AppLayout } from './pages/_layouts/app'
import { Login } from './pages/app/login'
import { Home } from './pages/app/home'
import { Alvaras } from './pages/app/captacao-alvaras'
import { Companies } from './pages/app/busca-dados'
import { Leads } from './pages/app/gestao-leads'
import { Pipeline } from './pages/app/pipeline-crm'
import { ArchivedProposals } from './pages/app/archived-proposals'
import { Profile } from './pages/app/profile'
import { Logs } from './pages/app/logs'
import { Plans } from './pages/app/plans'

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
        <Route path="/dashboard/busca-empresa" element={<Companies />} />
        <Route path="/dashboard/gestao-leads" element={<Leads />} />
        <Route path="/dashboard/pipeline-crm" element={<Pipeline />} />
        <Route
         path="/dashboard/propostas-arquivadas"
         element={<ArchivedProposals />}
        />
        <Route path="/dashboard/minha-conta" element={<Profile />} />
        <Route path="/dashboard/solicitacoes" element={<Plans />} />
        <Route path="/dashboard/logs" element={<Logs />} />
       </Route>
      </Route>
     </Routes>
    </BrowserRouter>
   </ThemeProvider>
  </QueryClientProvider>
 )
}
