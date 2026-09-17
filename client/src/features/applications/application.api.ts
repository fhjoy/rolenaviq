import { apiRequest } from "@/services/api";

import type {
  Application,
  ApplicationsResponse,
  ApplicationQueryParams,
  ApplicationStatus,
  EmploymentType,
  WorkplaceType,
} from "@/types/application";

export function getApplications(
  params: ApplicationQueryParams = {},
): Promise<ApplicationsResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.workplaceType) searchParams.set("workplaceType", params.workplaceType);
  if (params.employmentType) searchParams.set("employmentType", params.employmentType);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.sort) searchParams.set("sort", params.sort);

  const queryString = searchParams.toString();

  return apiRequest<ApplicationsResponse>(
    `/applications${queryString ? `?${queryString}` : ""}`,
  );
}

export interface CreateApplicationData {
  company: string;
  position: string;
  jobUrl?: string;
  location?: string;
  workplaceType?: WorkplaceType;
  employmentType?: EmploymentType;
  status: ApplicationStatus;
  technologies: string[];
  appliedAt?: string;
  interviewDate?: string;
  notes?: string;
}

export type UpdateApplicationData = Partial<
  Omit<
    CreateApplicationData,
    | "jobUrl"
    | "location"
    | "workplaceType"
    | "employmentType"
    | "appliedAt"
    | "interviewDate"
    | "notes"
  >
> & {
  jobUrl?: string | null;
  location?: string | null;
  workplaceType?: WorkplaceType | null;
  employmentType?: EmploymentType | null;
  appliedAt?: string | null;
  interviewDate?: string | null;
  notes?: string | null;
  reopen?: boolean;
};

export function createApplication(data: CreateApplicationData): Promise<{
  message: string;
  application: Application;
}> {
  return apiRequest("/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getApplicationById(id: string): Promise<{
  application: Application;
}> {
  return apiRequest(`/applications/${id}`);
}

export function updateApplication(
  id: string,
  data: UpdateApplicationData,
): Promise<{
  message: string;
  application: Application;
}> {
  return apiRequest(`/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteApplication(id: string): Promise<{
  message: string;
}> {
  return apiRequest(`/applications/${id}`, {
    method: "DELETE",
  });
}
