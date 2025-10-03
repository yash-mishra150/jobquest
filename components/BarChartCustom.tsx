"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A multiple bar chart"

const chartData = [
  { Job: "Job1", Applications: 186, Shorlisted: 80 },
  { Job: "Job2", Applications: 305, Shorlisted: 200 },
  { Job: "Job3", Applications: 237, Shorlisted: 120 },
  { Job: "Job4", Applications: 73, Shorlisted: 40 },
  { Job: "Job5", Applications: 209, Shorlisted: 130 },
  { Job: "Job6", Applications: 214, Shorlisted: 140 },
]

const chartConfig = {
  Applications: {
    label: "Applications",
    color: "var(--chart-1)",
  },
  Shorlisted: {
    label: "Shorlisted",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function BarChartCustom() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart - Multiple</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="Job"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="Applications" fill="var(--color-Applications)" radius={4} />
            <Bar dataKey="Shorlisted" fill="var(--color-Shorlisted)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
