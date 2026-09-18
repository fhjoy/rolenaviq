const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function warmUpApi(): Promise<void> {
  try {
    await fetch(API_URL + "/health", {
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    // Warm-up is best-effort. Normal API requests still handle failures.
  }
}

function redirectToLoginOnExpiredSession(endpoint: string, status: number) {
  if (
    status !== 401 ||
    endpoint === "/auth/login" ||
    endpoint === "/auth/me" ||
    typeof window === "undefined" ||
    window.location.pathname === "/login"
  ) {
    return;
  }

  window.location.assign("/login?expired=1");
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "Something went wrong",
    }));

    redirectToLoginOnExpiredSession(endpoint, response.status);

    throw new ApiError(errorData.message || "Request failed", response.status);
  }

  return response.json() as Promise<T>;
}
