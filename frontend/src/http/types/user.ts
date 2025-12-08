export interface UserPlan {
  id: number
  name: string
  monthly_credits: number
}

export interface UserProfile {
  id: number
  name: string
  email?: string
  plan_id: number
  credits: number
  monthly_used: number
  plan_renews_at: string
  last_renewal_at: string
  plan: UserPlan
}