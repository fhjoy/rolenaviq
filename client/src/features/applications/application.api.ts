import { apiRequest } from "@/services/api";

import type { Application, ApplicationsResponse } from "@/types/application";

export function getApplications(): Promise<ApplicationsResponse> {
  return apiRequest<ApplicationsResponse>(
    "/applications?page=1&limit=10&sort=-createdAt",
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
