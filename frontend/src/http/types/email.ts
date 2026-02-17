export type EmailStatus = {
  gmail: { connected: boolean; email?: string | null }
  outlook: { connected: boolean; email?: string | null }
}
