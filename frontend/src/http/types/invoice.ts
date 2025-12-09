export interface Invoice {
  id: number
  user_id: number
  description: string
  amount: number
  status: 'pending' | 'paid' | 'failed'
  due_date: string         
  paid_at: string | null   
  invoice_url: string | null
  created_at: string | null
  updated_at: string | null
}
