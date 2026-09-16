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

const activeStageOrder: ApplicationStatus[] = [
  "saved",
  "applied",
  "screening",
  "interview",
  "technical_interview",
  "offer",
];

const terminalStatuses = new Set<ApplicationStatus>([
  "offer",
  "rejected",
  "withdrawn",
]);

export function isTerminalStatus(status: ApplicationStatus): boolean {
  return terminalStatuses.has(status);
}

export function canMoveApplication(
  currentStatus: ApplicationStatus,
  nextStatus: ApplicationStatus,
): boolean {
  if (currentStatus === nextStatus) {
    return true;
  }

  if (isTerminalStatus(currentStatus)) {
    return false;
  }

  if (nextStatus === "rejected" || nextStatus === "withdrawn") {
    return true;
  }

  const currentIndex = activeStageOrder.indexOf(currentStatus);
  const nextIndex = activeStageOrder.indexOf(nextStatus);

  if (currentIndex === -1 || nextIndex === -1) {
    return false;
  }

  return nextIndex > currentIndex;
}
