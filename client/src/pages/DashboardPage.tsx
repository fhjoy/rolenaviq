import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/services/api";

interface HealthResponse {
  status: string;
  service: string;
}

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiRequest<HealthResponse>("/health"),
  });

  if (isLoading) {
    return <p className="p-8">Loading...</p>;
  }

  if (isError) {
    return <p className="p-8">Backend connection failed</p>;
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">RoleNaviq Dashboard</h1>

      <p className="mt-4">API status: {data?.status}</p>

      <p>Service: {data?.service}</p>
    </main>
  );
}
