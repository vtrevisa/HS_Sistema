export interface TarefaAgendada {
  id: string;
  title: string;
  description: string;
  date: Date;
  hour: string;
  priority: 'baixa' | 'media' | 'alta';
  eventType: 'tarefa';
}
