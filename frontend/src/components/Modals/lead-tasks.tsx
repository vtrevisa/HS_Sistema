import { Button } from "@/components/ui/button"
import { Card } from '../ui/card'
import { X, CalendarCheck, CalendarPlus } from "lucide-react"
import { useEffect } from "react"

interface LeadTaskModalProps {
    onEmptyChange?: (isEmpty: boolean) => void
}

const tasks = [
/*     { id: 1, title: "Task 1", description: "Description 1", date: "01-02-2026", hour: "10:00", priority: "Media", user_id: 2, lead_id: 93, created_at: "2024-05-01", updated_at: "2024-05-02" },
    { id: 2, title: "Task 2", description: "Description 2", date: "02-02-2026", hour: "09:00", priority: "Baixa", user_id: 2, lead_id: 92, created_at: "2024-05-01", updated_at: "2024-05-02" },
    { id: 1, title: "Task 1", description: "Description 1", date: "01-02-2026", hour: "08:00", priority: "Alta", user_id: 2, lead_id: 91, created_at: "2024-05-01", updated_at: "2024-05-02" }
 */]

export function LeadTasksModal({ onEmptyChange }: LeadTaskModalProps) {
    useEffect(() => {
        onEmptyChange?.(tasks.length === 0)
    }, [tasks.length, onEmptyChange])

    if (tasks.length === 0) return null
    
    return (
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-9 w-9 rounded-md bg-amber-100 text-amber-700">
                        <CalendarCheck size={18} />
                    </div>
                    <div>
                        <h4 className="font-semibold">Tarefas</h4>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => { /* abrir quick create */ }} aria-label="Nova Tarefa">
                        <CalendarPlus size={16} />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto max-h-[60vh] pb-2">
                {/* Empty state */}
                <div className="flex flex-col gap-3 text-center text-sm text-muted-foreground py-6">  
                    {tasks.length !== 0 && (
                    <Card
                        className="flex items-start gap-3">
                        <div className="flex-1 min-w-0 font-medium self-center break-words whitespace-normal text-left pl-3">
                            Título
                        </div>
                        <div className="flex-shrink-0 self-center text-sm text-muted-foreground whitespace-nowrap">
                            Data-Hora
                        </div>
                        <Button 
                            variant="ghost"
                            size="sm"
                            className="flex-shrink-0 ml-2 self-center"
                        >
                            <X size={16} />
                        </Button>
                    </Card>)}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-3">
                <Button className="w-full" onClick={() => { /* abrir form completo */ }}>
                    <CalendarPlus size={16} className="mr-2" />
                    Nova Tarefa
                </Button>
            </div>
        </div>
    )
}