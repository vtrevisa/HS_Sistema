export type PlanRequestStatus = 'pending' | 'approved' | 'rejected';

export interface PlanRequest {
  id: number;
  status: PlanRequestStatus;
  user: {
    id: number;
    name: string;
    email: string;
  };
  current_plan: {
    id: number;
    name: string;
  };
  requested_plan: {
    id: number;
    name: string;
  };
  created_at: string;
}