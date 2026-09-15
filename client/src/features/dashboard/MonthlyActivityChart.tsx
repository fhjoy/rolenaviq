import {
  CartesianGrid,
  Line,
  LineChart,
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

import type { MonthlyActivityItem } from "@/types/dashboard";

interface MonthlyActivityChartProps {
  data: MonthlyActivityItem[];
}

function formatMonth(value: string) {
  const [year, month] = value.split("-");

  const date = new Date(Number(year), Number(month) - 1);

  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  });
}

export function MonthlyActivityChart({ data }: MonthlyActivityChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    label: formatMonth(item.month),
  }));

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Application activity</CardTitle>

        <CardDescription>
          Applications added over the last months
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.35}
              />

              <XAxis
                dataKey="label"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />

              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />

              <Tooltip
                cursor={{
                  strokeDasharray: "4 4",
                }}
                contentStyle={{
                  borderRadius: "12px",
                }}
              />

              <Line
                type="monotone"
                dataKey="count"
                stroke="currentColor"
                className="text-primary"
                strokeWidth={3}
                dot={{
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
