export type EmailStatus = {
  gmail: { connected: boolean; email?: string | null }
  microsoft: { connected: boolean; email?: string | null }
}
