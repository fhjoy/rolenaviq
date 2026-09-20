import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render";

import { ApplicationForm } from "./ApplicationForm";
import type { ApplicationFormData } from "./application.schemas";

const defaultValues: ApplicationFormData = {
  company: "",
  position: "",
  jobUrl: "",
  location: "",
  workplaceType: "",
  employmentType: "",
  status: "saved",
  technologies: "",
  appliedAt: "",
  interviewDate: "",
  notes: "",
};

function renderForm(
  onSubmit = vi.fn(),
  values: ApplicationFormData = defaultValues,
) {
  renderWithProviders(
    <ApplicationForm
      defaultValues={values}
      onSubmit={onSubmit}
      isSubmitting={false}
      submitLabel="Save application"
      cancelTo="/applications"
    />,
  );

  return onSubmit;
}

describe("ApplicationForm", () => {
  it("requires company and position", async () => {
    const user = userEvent.setup();

    renderForm();

    await user.click(
      screen.getByRole("button", {
        name: "Save application",
      }),
    );

    expect(
      await screen.findByText("Company is required"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Position is required"),
    ).toBeInTheDocument();
  });

  it("rejects non-http job URLs", async () => {
    const user = userEvent.setup();

    renderForm();

    await user.type(screen.getByLabelText("Company"), "Northstar Labs");
    await user.type(screen.getByLabelText("Position"), "Frontend Engineer");
    await user.type(screen.getByLabelText("Job URL"), "ftp://example.com/job");
    await user.click(
      screen.getByRole("button", {
        name: "Save application",
      }),
    );

    expect(
      await screen.findByText("Please enter a valid HTTP or HTTPS URL"),
    ).toBeInTheDocument();
  });

  it("requires an interview date when an interview stage is selected", async () => {
    const user = userEvent.setup();

    renderForm();

    await user.type(screen.getByLabelText("Company"), "Northstar Labs");
    await user.type(screen.getByLabelText("Position"), "Frontend Engineer");
    await user.selectOptions(
      screen.getByLabelText("Status"),
      "interview",
    );
    await user.click(
      screen.getByRole("button", {
        name: "Save application",
      }),
    );

    expect(
      await screen.findByText(
        "Interview date and time is required for interview stages",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Interview date & time")).toHaveAttribute(
      "aria-required",
      "true",
    );
  });

  it("submits valid interview form data", async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await user.type(screen.getByLabelText("Company"), "Northstar Labs");
    await user.type(screen.getByLabelText("Position"), "Frontend Engineer");
    await user.selectOptions(
      screen.getByLabelText("Status"),
      "interview",
    );
    await user.type(
      screen.getByLabelText("Interview date & time"),
      "2026-10-20T10:30",
    );
    await user.click(
      screen.getByRole("button", {
        name: "Save application",
      }),
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        company: "Northstar Labs",
        position: "Frontend Engineer",
        status: "interview",
        interviewDate: "2026-10-20T10:30",
      }),
      expect.anything(),
    );
  });
});
