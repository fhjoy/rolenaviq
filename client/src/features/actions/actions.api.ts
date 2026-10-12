import { apiRequest } from "@/services/api";

export interface FollowUpAction {
  _id: string;
  applicationId: { _id: string; company: string; position: string };
  title: string;
  dueDate: string;
  completedAt?: string;
}

export interface ActionsResponse {
  actions: FollowUpAction[];
  pagination: { page: number; limit: number; total: number; hasNextPage: boolean };
}

export function getActions(params: { applicationId?: string; status?: "open" | "completed" | "all"; page?: number; limit?: number }, signal?: AbortSignal) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined) query.set(key, String(value));
  return apiRequest<ActionsResponse>(`/actions?${query}`, { signal });
}

export function createAction(applicationId: string, title: string, dueDate: string) {
  return apiRequest<{ action: FollowUpAction }>("/actions", {
    method: "POST", body: JSON.stringify({ applicationId, title, dueDate }),
  });
}

export function updateAction(id: string, change: { title?: string; dueDate?: string; completed?: boolean }) {
  return apiRequest<{ action: FollowUpAction }>(`/actions/${id}`, { method: "PATCH", body: JSON.stringify(change) });
}

export function deleteAction(id: string) {
  return apiRequest<{ message: string }>(`/actions/${id}`, { method: "DELETE" });
}
