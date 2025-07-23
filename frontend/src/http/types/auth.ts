export type AuthRequest = {
  login: string
  password: string
}

export interface AuthResponse {
  status: boolean
  message: string
  token: string
  user: {
    id: string
    name: string
    email: string
  }
}