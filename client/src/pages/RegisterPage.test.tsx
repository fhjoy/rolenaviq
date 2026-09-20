import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render";
import { server } from "@/test/server";

import { RegisterPage } from "./RegisterPage";

const API_URL = "http://localhost/api";

function renderRegister() {
  return renderWithProviders(
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<div>Login destination</div>} />
    </Routes>,
    {
      route: "/register",
    },
  );
}

async function fillRegistrationForm(
  user: ReturnType<typeof userEvent.setup>,
  password = "StrongPass123!",
  confirmPassword = "StrongPass123!",
) {
  await user.type(screen.getByLabelText("First name"), "Test");
  await user.type(screen.getByLabelText("Last name"), "User");
  await user.type(screen.getByLabelText("Email"), "user@example.com");
  await user.type(screen.getByLabelText("Password"), password);
  await user.type(
    screen.getByLabelText("Confirm password"),
    confirmPassword,
  );
}

describe("RegisterPage", () => {
  it("rejects mismatched passwords", async () => {
    const user = userEvent.setup();

    renderRegister();

    await fillRegistrationForm(
      user,
      "StrongPass123!",
      "DifferentPass123!",
    );
    await user.click(
      screen.getByRole("button", {
        name: "Create account",
      }),
    );

    expect(
      await screen.findByText("Passwords do not match"),
    ).toBeInTheDocument();
  });

  it("submits valid registration data and navigates to login", async () => {
    server.use(
      http.post(`${API_URL}/auth/register`, async ({ request }) => {
        const body = (await request.json()) as Record<string, string>;

        expect(body).toEqual({
          firstName: "Test",
          lastName: "User",
          email: "user@example.com",
          password: "StrongPass123!",
        });
        expect(body.confirmPassword).toBeUndefined();

        return HttpResponse.json(
          {
            message: "User registered successfully",
            user: {
              id: "user-1",
              firstName: "Test",
              lastName: "User",
              email: "user@example.com",
            },
          },
          {
            status: 201,
          },
        );
      }),
    );

    const user = userEvent.setup();

    renderRegister();

    await fillRegistrationForm(user);
    await user.click(
      screen.getByRole("button", {
        name: "Create account",
      }),
    );

    expect(
      await screen.findByText("Login destination"),
    ).toBeInTheDocument();
  });

  it("shows API registration errors", async () => {
    server.use(
      http.post(`${API_URL}/auth/register`, () =>
        HttpResponse.json(
          {
            message: "A user with this email already exists",
          },
          {
            status: 409,
          },
        ),
      ),
    );

    const user = userEvent.setup();

    renderRegister();

    await fillRegistrationForm(user);
    await user.click(
      screen.getByRole("button", {
        name: "Create account",
      }),
    );

    expect(
      await screen.findByText("A user with this email already exists"),
    ).toBeInTheDocument();
  });
});
