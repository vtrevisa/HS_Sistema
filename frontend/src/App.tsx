import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { Login } from './pages/app/login'
import { AppLayout } from './pages/_layouts/app'
import { Home } from './pages/app/home'
import { Leads } from './pages/app/leads'

export function App() {
 return (
  <ThemeProvider>
   <BrowserRouter>
    <Routes>
     <Route path="/" element={<Login />} />
     <Route element={<AppLayout />}>
      <Route path="/dashboard" element={<Home />} />
      <Route path="/dashboard/leads" element={<Leads />} />
     </Route>
    </Routes>
   </BrowserRouter>
  </ThemeProvider>
 )
}
