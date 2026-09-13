import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle>Applications over time</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-80">
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis dataKey="label" fontSize={12} />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="count"
                stroke="currentColor"
                className="text-primary"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
