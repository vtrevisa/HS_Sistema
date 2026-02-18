export interface Task {
  id: string;
  title: string;
  description: string;
  date: Date;
  hour: string;
  priority: 'baixa' | 'media' | 'alta';
  completed?: boolean
}

export interface TaskResponse {
  id: string
  title: string
  description: string
  date: string        
  hour: string
  priority: 'baixa' | 'media' | 'alta'
}

export interface AlvaraResponse {
  id: number
  company: string
  service: string
  validity: string
  address: string
}


export interface Alvara {
  id: string
  company: string
  type: string
  validity: Date
  address: string
}