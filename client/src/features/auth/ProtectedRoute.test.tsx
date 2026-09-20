import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import { ProtectedRoute } from "./ProtectedRoute";
import { renderWithProviders } from "@/test/render";
import { server } from "@/test/server";

const API_URL = "http://localhost/api";

function renderProtectedRoute() {
  return renderWithProviders(
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<div>Protected dashboard</div>} />
      </Route>
      <Route path="/login" element={<div>Login destination</div>} />
    </Routes>,
    {
      route: "/dashboard",
    },
  );
}

describe("ProtectedRoute", () => {
  it("shows protected content for an authenticated user", async () => {
    server.use(
      http.get(`${API_URL}/auth/me`, () =>
        HttpResponse.json({
          user: {
            id: "user-1",
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
          },
        }),
      ),
    );

    renderProtectedRoute();

    expect(
      await screen.findByText("Protected dashboard"),
    ).toBeInTheDocument();
  });

  it("redirects a 401 response to the expired-session login page", async () => {
    server.use(
      http.get(`${API_URL}/auth/me`, () =>
        HttpResponse.json(
          {
            message: "Authentication required",
          },
          {
            status: 401,
          },
        ),
      ),
    );

    renderProtectedRoute();

    expect(await screen.findByText("Login destination")).toBeInTheDocument();
  });

  it("shows a retryable error for non-authentication failures", async () => {
    let attempts = 0;

    server.use(
      http.get(`${API_URL}/auth/me`, () => {
        attempts += 1;

        if (attempts === 1) {
          return HttpResponse.json(
            {
              message: "Server unavailable",
            },
            {
              status: 500,
            },
          );
        }

        return HttpResponse.json({
          user: {
            id: "user-1",
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
          },
        });
      }),
    );

    const user = userEvent.setup();

    renderProtectedRoute();

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Unable to verify your session");

    await user.click(
      screen.getByRole("button", {
        name: "Try again",
      }),
    );

    expect(
      await screen.findByText("Protected dashboard"),
    ).toBeInTheDocument();
  });
});
