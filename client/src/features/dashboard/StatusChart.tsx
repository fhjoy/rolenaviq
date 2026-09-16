import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { applicationStatusLabels } from "@/features/applications/application-display";

import type { ApplicationStatus } from "@/types/application";
import type { StatusDistributionItem } from "@/types/dashboard";

interface StatusChartProps {
  data: StatusDistributionItem[];
}

export function StatusChart({ data }: StatusChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    label:
      applicationStatusLabels[item.status as ApplicationStatus] ?? item.status,
  }));

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Application pipeline</CardTitle>

        <CardDescription>
          Where your current opportunities stand
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 40,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.35}
              />

              <XAxis
                dataKey="label"
                angle={-25}
                textAnchor="end"
                height={70}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />

              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />

              <Tooltip
                cursor={{
                  fill: "var(--muted)",
                  opacity: 0.4,
                }}
                contentStyle={{
                  borderRadius: "12px",
                }}
              />

              <Bar
                dataKey="count"
                fill="currentColor"
                className="text-brand"
                radius={[6, 6, 0, 0]}
                maxBarSize={46}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
