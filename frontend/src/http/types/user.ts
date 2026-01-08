export interface UserPlan {
  id: number
  name: string
  monthly_credits: number
}


export interface UserRequest {
  id: number
  role?: string
  status?: 'active' | 'inactive' | 'pending' | 'blocked'
  name: string
  email: string
  phone: string
  company: string
  alvarasUsed: number
  cnpj: string
  cep?: string
  number?: string
  address: string
  last_login_at: string
  created_at: string
  plan: UserPlan | null
}

export interface UpdateUserPasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export type UserRole = 'admin' | 'user'