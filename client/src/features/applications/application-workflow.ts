import type { ApplicationStatus } from "@/types/application";

export const applicationStatuses: ApplicationStatus[] = [
  "saved",
  "applied",
  "screening",
  "interview",
  "technical_interview",
  "offer",
  "rejected",
  "withdrawn",
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

export function isInterviewStatus(status: ApplicationStatus): boolean {
  return status === "interview" || status === "technical_interview";
}

export function isReopenTransition(
  currentStatus: ApplicationStatus,
  nextStatus: ApplicationStatus,
): boolean {
  return (
    (currentStatus === "rejected" || currentStatus === "withdrawn") &&
    nextStatus === "applied"
  );
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

export function getEditableApplicationStatuses(
  currentStatus: ApplicationStatus,
): ApplicationStatus[] {
  return applicationStatuses.filter(
    (status) =>
      canMoveApplication(currentStatus, status) ||
      isReopenTransition(currentStatus, status),
  );
}
