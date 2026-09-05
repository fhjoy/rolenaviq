const API_URL = import.meta.env.VITE_API_URL;

type ApiOptions = RequestInit;

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,

    credentials: "include",

    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Something went wrong",
    }));

    throw new Error(error.message || "Request failed");
  }

  return response.json() as Promise<T>;
}
