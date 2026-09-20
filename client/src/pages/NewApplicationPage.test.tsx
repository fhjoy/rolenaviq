import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render";
import { server } from "@/test/server";

import { NewApplicationPage } from "./NewApplicationPage";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const API_URL = "http://localhost/api";

describe("NewApplicationPage", () => {
  it("transforms form data, creates the application and navigates back", async () => {
    let submittedBody: Record<string, unknown> | undefined;

    server.use(
      http.post(`${API_URL}/applications`, async ({ request }) => {
        submittedBody = (await request.json()) as Record<string, unknown>;

        return HttpResponse.json(
          {
            message: "Application created successfully",
            application: {
              _id: "application-1",
              ...submittedBody,
              createdAt: "2026-09-21T10:00:00.000Z",
              updatedAt: "2026-09-21T10:00:00.000Z",
            },
          },
          {
            status: 201,
          },
        );
      }),
    );

    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route
          path="/applications/new"
          element={<NewApplicationPage />}
        />
        <Route
          path="/applications"
          element={<div>Applications destination</div>}
        />
      </Routes>,
      {
        route: "/applications/new",
      },
    );

    await user.type(screen.getByLabelText("Company"), "Northstar Labs");
    await user.type(screen.getByLabelText("Position"), "Frontend Engineer");
    await user.type(
      screen.getByLabelText("Technologies"),
      "React, TypeScript, Node.js",
    );
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

    expect(
      await screen.findByText("Applications destination"),
    ).toBeInTheDocument();

    expect(submittedBody).toMatchObject({
      company: "Northstar Labs",
      position: "Frontend Engineer",
      status: "interview",
      technologies: ["React", "TypeScript", "Node.js"],
    });

    expect(submittedBody).not.toHaveProperty("jobUrl");
    expect(submittedBody).not.toHaveProperty("location");
    expect(submittedBody).not.toHaveProperty("workplaceType");
    expect(submittedBody).not.toHaveProperty("employmentType");
    expect(submittedBody).not.toHaveProperty("appliedAt");
    expect(submittedBody).not.toHaveProperty("notes");

    expect(submittedBody?.interviewDate).toBe(
      new Date("2026-10-20T10:30").toISOString(),
    );
  });
});
