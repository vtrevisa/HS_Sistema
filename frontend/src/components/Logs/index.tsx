import { handleExportLogs } from '@/services/logs'
import type { SelectedMonth } from '../ui/month-picker'
import { useMemo, useState } from 'react'
import { LogActions } from './log-actions'
import { LogCards } from './log-cards'
import { LogFilters } from './log-filters'
import { LogTable } from './log-table'
import { useLog } from '@/http/use-logs'

export function Logs() {
 const [user, setUser] = useState('')
 const [city, setCity] = useState('')
 const [selectedTypeFilter, setSelectedTypeFilter] = useState<
  'Todos' | 'AVCB' | 'CLCB'
 >('Todos')
 const [selectedMonth, setSelectedMonth] = useState<SelectedMonth | undefined>()

 const { logs, isLoading } = useLog()

 const filteredLogs = useMemo(() => {
  return logs.filter(log => {
   const matchUser =
    log.userName.toLowerCase().includes(user.toLowerCase()) ||
    log.userEmail.toLowerCase().includes(user.toLowerCase())

   const matchCity = log.city.toLowerCase().includes(city.toLowerCase())
   const matchService =
    selectedTypeFilter === 'Todos' ||
    log.service === selectedTypeFilter ||
    log.service === 'Todos'

   const matchMonth =
    !selectedMonth ||
    (() => {
     const date = new Date(log.consumedAt)
     return (
      date.getMonth() + 1 === selectedMonth.month &&
      date.getFullYear() === selectedMonth.year
     )
    })()

   return matchUser && matchCity && matchService && matchMonth
  })
 }, [logs, user, city, selectedTypeFilter, selectedMonth])

 const totalConsumed = filteredLogs.reduce((sum, log) => sum + log.quantity, 0)
 const uniqueUsers = new Set(filteredLogs.map(log => log.userId)).size

 if (isLoading) {
  return <p>Carregando logs...</p>
 }

 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
    <div>
     <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
      Logs de Alvarás Consumidos
     </h1>
     <p className="text-muted-foreground">
      Histórico de consumo de alvarás por todos os usuários
     </p>
    </div>
    <LogActions onExportClick={() => handleExportLogs(filteredLogs)} />
   </div>

   {/* Stats Cards */}
   <LogCards
    filteredLogs={filteredLogs}
    totalConsumed={totalConsumed}
    uniqueUsers={uniqueUsers}
   />

   {/* Filtros */}
   <LogFilters
    user={user}
    setUser={setUser}
    city={city}
    setCity={setCity}
    selectedType={selectedTypeFilter}
    setSelectedType={setSelectedTypeFilter}
    selectedMonth={selectedMonth}
    setSelectedMonth={setSelectedMonth}
   />

   {/* Logs Table */}
   <LogTable filteredLogs={filteredLogs} />
  </div>
 )
}
