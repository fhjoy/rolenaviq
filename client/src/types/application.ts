export type ApplicationStatus =
  | "saved"
  | "applied"
  | "screening"
  | "interview"
  | "technical_interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export type WorkplaceType = "remote" | "hybrid" | "onsite";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "freelance"
  | "internship";

export interface Application {
  _id: string;

  company: string;
  position: string;

  jobUrl?: string;
  location?: string;

  workplaceType?: WorkplaceType;
  employmentType?: EmploymentType;

  status: ApplicationStatus;

  technologies: string[];

  salaryMin?: number;
  salaryMax?: number;
  currency?: string;

  appliedAt?: string;
  interviewDate?: string;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApplicationsResponse {
  applications: Application[];
  pagination: Pagination;
}
