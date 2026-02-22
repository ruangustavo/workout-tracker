"use client";

import { useQuery } from "convex/react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
	volume: {
		label: "Volume (kg)",
		color: "var(--color-primary)",
	},
} satisfies ChartConfig;

type ExerciseProgressProps = {
	exerciseId: Id<"exercises">;
};

export function ExerciseProgress({ exerciseId }: ExerciseProgressProps) {
	const data = useQuery(api.exerciseLogs.getProgressData, {
		exercise: exerciseId,
	});

	if (data === undefined) {
		return <Skeleton className="h-48 w-full" />;
	}

	if (data.length === 0) {
		return (
			<p className="py-4 text-center text-xs text-muted-foreground">
				Sem dados de progresso ainda.
			</p>
		);
	}

	const chartData = data.map((d: { date: number; volume: number; maxWeight: number }) => ({
		date: format(new Date(d.date), "dd/MM"),
		volume: d.volume,
	}));

	return (
		<ChartContainer config={chartConfig} className="h-48 w-full">
			<LineChart data={chartData}>
				<CartesianGrid vertical={false} />
				<XAxis
					dataKey="date"
					tickLine={false}
					axisLine={false}
					tickMargin={8}
				/>
				<YAxis tickLine={false} axisLine={false} tickMargin={8} />
				<ChartTooltip content={<ChartTooltipContent />} />
				<Line
					type="monotone"
					dataKey="volume"
					stroke="var(--color-volume)"
					strokeWidth={2}
					dot={{ r: 3 }}
				/>
			</LineChart>
		</ChartContainer>
	);
}
