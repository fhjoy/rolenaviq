import { apiRequest } from "@/services/api";

import type {
  Application,
  ApplicationsResponse,
  ApplicationQueryParams,
} from "@/types/application";

export function getApplications(
  params: ApplicationQueryParams = {},
): Promise<ApplicationsResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.workplaceType) {
    searchParams.set("workplaceType", params.workplaceType);
  }

  if (params.employmentType) {
    searchParams.set("employmentType", params.employmentType);
  }

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

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

  workplaceType?: string;
  employmentType?: string;

  status: string;

  technologies: string[];

  appliedAt?: string;
  notes?: string;
}

export function createApplication(data: CreateApplicationData): Promise<{
  message: string;
  application: Application;
}> {
  return apiRequest("/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
