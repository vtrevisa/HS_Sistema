export interface UserPlan {
  id: number
  name: string
  monthly_credits: number
}

export interface UserRequest {
  id: number
  name: string
  email: string
  phone: string
  company: string
  cnpj: string
  cep?: string
  number?: string
  address: string
  created_at: string
}

export interface UpdateUserPasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}
