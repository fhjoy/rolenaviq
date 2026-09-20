import { describe, expect, it } from "vitest";

import {
  canMoveApplication,
  getEditableApplicationStatuses,
  isReopenTransition,
  isTerminalStatus,
} from "./application-workflow";

describe("application workflow", () => {
  it("allows forward progress through active stages", () => {
    expect(canMoveApplication("saved", "applied")).toBe(true);
    expect(canMoveApplication("applied", "interview")).toBe(true);
    expect(canMoveApplication("screening", "offer")).toBe(true);
  });

  it("does not allow normal movement out of terminal statuses", () => {
    expect(isTerminalStatus("offer")).toBe(true);
    expect(isTerminalStatus("rejected")).toBe(true);
    expect(canMoveApplication("offer", "screening")).toBe(false);
    expect(canMoveApplication("rejected", "applied")).toBe(false);
  });

  it("supports explicit reopen transitions for rejected and withdrawn applications", () => {
    expect(isReopenTransition("rejected", "applied")).toBe(true);
    expect(isReopenTransition("withdrawn", "applied")).toBe(true);
    expect(isReopenTransition("offer", "applied")).toBe(false);
  });

  it("returns editable statuses that include valid next steps and reopen targets", () => {
    expect(getEditableApplicationStatuses("saved")).toEqual([
      "saved",
      "applied",
      "screening",
      "interview",
      "technical_interview",
      "offer",
      "rejected",
      "withdrawn",
    ]);

    expect(getEditableApplicationStatuses("rejected")).toEqual([
      "applied",
      "rejected",
    ]);
  });
});
