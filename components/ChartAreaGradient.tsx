"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "January", jobsPosted: 12, applicants: 80 },
  { month: "February", jobsPosted: 18, applicants: 120 },
  { month: "March", jobsPosted: 15, applicants: 95 },
  { month: "April", jobsPosted: 10, applicants: 140 },
  { month: "May", jobsPosted: 20, applicants: 160 },
  { month: "June", jobsPosted: 17, applicants: 110 },
];

const chartConfig = {
  jobsPosted: {
    label: "Jobs Posted",
    color: "var(--chart-1)",
  },
  applicants: {
    label: "Applicants",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartAreaGradient() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobs & Applicants (Last 6 Months)</CardTitle>
        <CardDescription>
          Overview of jobs posted and applicants received
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillJobsPosted" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-jobsPosted)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-jobsPosted)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillApplicants" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-applicants)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-applicants)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="applicants"
              type="natural"
              fill="url(#fillApplicants)"
              fillOpacity={0.4}
              stroke="var(--color-applicants)"
              stackId="a"
            />
            <Area
              dataKey="jobsPosted"
              type="natural"
              fill="url(#fillJobsPosted)"
              fillOpacity={0.4}
              stroke="var(--color-jobsPosted)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 12% in applicants this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
