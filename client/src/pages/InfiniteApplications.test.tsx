import { http, HttpResponse } from "msw";
import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render";
import { server } from "@/test/server";

import { ApplicationsPage } from "./ApplicationsPage";
import { DashboardPage } from "./DashboardPage";

vi.mock("@/features/dashboard/StatusChart", () => ({
  StatusChart: () => <div>Application pipeline chart</div>,
}));
vi.mock("@/features/dashboard/MonthlyActivityChart", () => ({
  MonthlyActivityChart: () => <div>Application activity chart</div>,
}));

const API_URL = "http://localhost/api";

afterEach(() => vi.unstubAllGlobals());

function application(number: number) {
  return {
    _id: `application-${number}`,
    company: `Company ${number}`,
    position: `Role ${number}`,
    status: "applied",
    technologies: [],
    createdAt: "2026-10-06T10:00:00.000Z",
    updatedAt: "2026-10-06T10:00:00.000Z",
  };
}

function pagedResponse(page: number) {
  return {
    applications: page === 1
      ? Array.from({ length: 10 }, (_, index) => application(index + 1))
      : [application(11)],
    pagination: {
      page,
      limit: 10,
      total: 11,
      totalPages: 2,
      hasNextPage: page === 1,
      hasPreviousPage: page > 1,
    },
  };
}

describe("infinite applications", () => {
  it("fetches the next page when the list reaches the viewport", async () => {
    let onIntersect: IntersectionObserverCallback | undefined;
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) {
        onIntersect = callback;
      }
      observe() {}
      disconnect() {}
    });

    server.use(
      http.get(`${API_URL}/applications`, ({ request }) =>
        HttpResponse.json(pagedResponse(Number(new URL(request.url).searchParams.get("page")))),
      ),
    );

    renderWithProviders(<ApplicationsPage />, { route: "/applications" });
    expect(await screen.findByText("Role 1")).toBeInTheDocument();
    expect(onIntersect).toBeDefined();

    act(() => onIntersect?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(await screen.findByText("Role 11")).toBeInTheDocument();
  });

  it("appends the next page and starts at page one when filters change", async () => {
    const requests: string[] = [];
    server.use(
      http.get(`${API_URL}/applications`, ({ request }) => {
        const url = new URL(request.url);
        requests.push(`${url.searchParams.get("status") ?? "all"}:${url.searchParams.get("page")}`);

        if (url.searchParams.get("status") === "interview") {
          return HttpResponse.json({
            applications: [{ ...application(20), status: "interview" }],
            pagination: { ...pagedResponse(1).pagination, total: 1, totalPages: 1, hasNextPage: false },
          });
        }

        return HttpResponse.json(pagedResponse(Number(url.searchParams.get("page"))));
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<ApplicationsPage />, { route: "/applications" });

    expect(await screen.findByText("Role 1")).toBeInTheDocument();
    expect(screen.queryByText("Role 11")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Load more" }));
    expect(await screen.findByText("Role 11")).toBeInTheDocument();
    expect(screen.getByText("Showing 11 of 11 applications")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Filter by status"), "interview");
    expect(await screen.findByText("Role 20")).toBeInTheDocument();
    expect(screen.queryByText("Role 11")).not.toBeInTheDocument();
    expect(requests).toEqual(["all:1", "all:2", "interview:1"]);
  });

  it("keeps the loaded cards when the next page fails and can retry", async () => {
    let pageTwoAttempts = 0;
    server.use(
      http.get(`${API_URL}/applications`, ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get("page"));
        if (page === 2 && ++pageTwoAttempts === 1) {
          return HttpResponse.json({ message: "Temporary error" }, { status: 500 });
        }
        return HttpResponse.json(pagedResponse(page));
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<ApplicationsPage />, { route: "/applications" });
    expect(await screen.findByText("Role 1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Load more" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load more");
    expect(screen.getByText("Role 1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Role 11")).toBeInTheDocument();
    expect(pageTwoAttempts).toBe(2);
  });

  it("loads more recent applications on the dashboard", async () => {
    server.use(
      http.get(`${API_URL}/auth/me`, () => HttpResponse.json({ user: { firstName: "Demo" } })),
      http.get(`${API_URL}/dashboard/stats`, () => HttpResponse.json({
        stats: { total: 11, applied: 11, interviews: 0, offers: 0, rejected: 0, responseRate: 0 },
        statusDistribution: [],
        monthlyActivity: [],
      })),
      http.get(`${API_URL}/applications`, ({ request }) =>
        HttpResponse.json(pagedResponse(Number(new URL(request.url).searchParams.get("page")))),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />, { route: "/dashboard" });

    const recent = (await screen.findByRole("heading", { name: "Recent applications" })).closest("section");
    expect(recent).not.toBeNull();
    expect(within(recent!).getByText("Role 1")).toBeInTheDocument();
    expect(within(recent!).queryByText("Role 11")).not.toBeInTheDocument();

    await user.click(within(recent!).getByRole("button", { name: "Load more" }));
    expect(await within(recent!).findByText("Role 11")).toBeInTheDocument();
  });
});
