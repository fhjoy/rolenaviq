import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import { Route, Routes, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render";
import { server } from "@/test/server";
import { VerifyEmailPage } from "./VerifyEmailPage";

const API_URL = "http://localhost/api";

function renderPage(route: string) {
  return renderWithProviders(
    <><LocationEcho /><Routes><Route path="/verify-email" element={<VerifyEmailPage />} /><Route path="/login" element={<div>Sign in</div>} /></Routes></>,
    { route },
  );
}

function LocationEcho() {
  const location = useLocation();
  return <output data-testid="location-hash" hidden>{location.hash}</output>;
}

describe("VerifyEmailPage", () => {
  it("posts the fragment token once and removes it from the URL", async () => {
    const token = "a".repeat(64);
    const sent = vi.fn();
    server.use(http.post(`${API_URL}/auth/verify-email`, async ({ request }) => {
      sent(await request.json());
      return HttpResponse.json({ message: "Email verified" });
    }));
    renderPage(`/verify-email#token=${token}`);
    expect(await screen.findByText("Email verified")).toBeInTheDocument();
    expect(sent).toHaveBeenCalledExactlyOnceWith({ token });
    expect(screen.getByTestId("location-hash")).toHaveTextContent(/^$/);
  });

  it("shows a recovery path for expired links", async () => {
    server.use(http.post(`${API_URL}/auth/verify-email`, () => HttpResponse.json(
      { message: "Invalid or expired verification link" }, { status: 400 },
    )));
    renderPage(`/verify-email#token=${"b".repeat(64)}`);
    expect(await screen.findByText(/invalid or expired/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send new link" })).toBeInTheDocument();
  });
});
