export interface UserPlan {
  id: number
  name: string
  monthly_credits: number
}

export interface UserProfile {
  id: number
  name: string
  email: string
  phone: string
  company: string
  cnpj: string
  address: string
  created_at: string
}