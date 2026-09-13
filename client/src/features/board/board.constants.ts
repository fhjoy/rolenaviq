import type { ApplicationStatus } from "@/types/application";

export interface BoardColumnDefinition {
  status: ApplicationStatus;
  title: string;
}

export const boardColumns: BoardColumnDefinition[] = [
  {
    status: "saved",
    title: "Saved",
  },
  {
    status: "applied",
    title: "Applied",
  },
  {
    status: "screening",
    title: "Screening",
  },
  {
    status: "interview",
    title: "Interview",
  },
  {
    status: "technical_interview",
    title: "Technical Interview",
  },
  {
    status: "offer",
    title: "Offer",
  },
  {
    status: "rejected",
    title: "Rejected",
  },
  {
    status: "withdrawn",
    title: "Withdrawn",
  },
];
