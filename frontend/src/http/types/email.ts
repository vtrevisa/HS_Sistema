export type EmailStatus = {
  gmail: { connected: boolean; email?: string | null }
  microsoft: { connected: boolean; email?: string | null }
}

export type EmailTemplate = {
    id: number;
    subject: string;
    body: string;
    user_id: number;
    active: boolean;
    position: number;
}
