"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { WeightEntry } from "@/types";

interface WeightChartProps {
  weightEntries: WeightEntry[];
}

const chartConfig = {
  weight: {
    label: "Weight",
    color: "hsl(142.1 76.2% 36.3%)", // Primary brand color (green)
  },
} satisfies ChartConfig;

export function WeightChart({ weightEntries }: WeightChartProps) {
  // Transform weight entries for the chart
  const chartData = weightEntries.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "numeric",
    }),
    weight: entry.value,
    fullDate: new Date(entry.date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  }));

  // Calculate weight trend
  const calculateTrend = () => {
    if (weightEntries.length < 2) return null;

    const firstWeight = weightEntries[0].value;
    const lastWeight = weightEntries[weightEntries.length - 1].value;
    const diff = lastWeight - firstWeight;
    const percentChange = ((diff / firstWeight) * 100).toFixed(1);

    return {
      diff: diff.toFixed(1),
      percentChange,
      direction: diff > 0 ? "up" : diff < 0 ? "down" : "stable",
    };
  };

  const trend = calculateTrend();

  return (
    <Card className={`gap-0 p-4`}>
      <CardHeader className="p-0">
        <CardTitle className="text-base">Progress</CardTitle>
        <CardDescription className="p-0">
          {weightEntries.length > 0
            ? `Tracking since ${new Date(
                weightEntries[0].date
              ).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}`
            : "No weight entries yet"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className={"h-32 w-full p-0"}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: -40,
                right: 12,
                top: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.split(" ")[0]}
                style={{ fontSize: "10px" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                style={{ fontSize: "10px" }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value, payload) => {
                      return payload[0]?.payload?.fullDate || value;
                    }}
                  />
                }
              />
              <Area
                dataKey="weight"
                type="linear"
                fill="var(--color-weight)"
                fillOpacity={0.4}
                stroke="var(--color-weight)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div
            className={`flex items-center justify-center h-32 text-neutral-500`}
          >
            No entries yet
          </div>
        )}
      </CardContent>
      {trend && (
        <CardFooter className="flex-col items-start gap-2 text-sm p-0 mt-2">
          <div className="flex gap-2 leading-none font-medium">
            {trend.direction === "up" && (
              <>
                Weight increased by {Math.abs(parseFloat(trend.diff))} kg (
                {trend.percentChange}%)
                <TrendingUp className="h-4 w-4 text-red-500" />
              </>
            )}
            {trend.direction === "down" && (
              <>
                Weight decreased by {Math.abs(parseFloat(trend.diff))} kg (
                {Math.abs(parseFloat(trend.percentChange))}%)
                <TrendingDown className="h-4 w-4 text-green-500" />
              </>
            )}
            {trend.direction === "stable" && (
              <>
                Weight stable
                <Minus className="h-4 w-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground leading-none text-xs">
            Based on {weightEntries.length} weight{" "}
            {weightEntries.length === 1 ? "entry" : "entries"}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
