import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import { DEMO_EMAIL, DEMO_PASSWORD } from "@/config/demo";
import { renderWithProviders } from "@/test/render";
import { server } from "@/test/server";

import { LoginPage } from "./LoginPage";

const API_URL = "http://localhost/api";

function renderLogin(route = "/login") {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<div>Dashboard destination</div>} />
    </Routes>,
    {
      route,
    },
  );
}

describe("LoginPage", () => {
  it("shows validation errors for invalid form input", async () => {
    const user = userEvent.setup();

    renderLogin();

    await user.type(
      screen.getByLabelText("Email"),
      "invalid-email",
    );
    await user.click(
      screen.getByRole("button", {
        name: "Sign in",
      }),
    );

    expect(
      await screen.findByText("Please enter a valid email address"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password is required"),
    ).toBeInTheDocument();
  });

  it("logs in successfully and navigates to the dashboard", async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, async ({ request }) => {
        const body = (await request.json()) as {
          email: string;
          password: string;
        };

        expect(body).toEqual({
          email: "user@example.com",
          password: "StrongPass123!",
        });

        return HttpResponse.json({
          message: "Login successful",
          user: {
            id: "user-1",
            firstName: "Test",
            lastName: "User",
            email: body.email,
          },
        });
      }),
    );

    const user = userEvent.setup();

    renderLogin();

    await user.type(
      screen.getByLabelText("Email"),
      "user@example.com",
    );
    await user.type(
      screen.getByLabelText("Password"),
      "StrongPass123!",
    );
    await user.click(
      screen.getByRole("button", {
        name: "Sign in",
      }),
    );

    expect(
      await screen.findByText("Dashboard destination"),
    ).toBeInTheDocument();
  });

  it("shows API login errors", async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json(
          {
            message: "Invalid email or password",
          },
          {
            status: 401,
          },
        ),
      ),
    );

    const user = userEvent.setup();

    renderLogin();

    await user.type(
      screen.getByLabelText("Email"),
      "user@example.com",
    );
    await user.type(
      screen.getByLabelText("Password"),
      "WrongPassword123!",
    );
    await user.click(
      screen.getByRole("button", {
        name: "Sign in",
      }),
    );

    expect(
      await screen.findByText("Invalid email or password"),
    ).toBeInTheDocument();
  });

  it("prefills the public demo credentials", () => {
    renderLogin("/login?demo=1");

    expect(screen.getByLabelText("Email")).toHaveValue(DEMO_EMAIL);
    expect(screen.getByLabelText("Password")).toHaveValue(DEMO_PASSWORD);
    expect(
      screen.getByRole("button", {
        name: "Enter demo",
      }),
    ).toBeInTheDocument();
  });
});
