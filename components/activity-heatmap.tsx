"use client";

import {
	addDays,
	addWeeks,
	endOfDay,
	format,
	isAfter,
	startOfDay,
	startOfWeek,
	subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const HEATMAP_WEEKS = 16;

function heatmapStart(): Date {
	const today = startOfDay(new Date());
	return startOfWeek(subWeeks(today, HEATMAP_WEEKS - 1), { weekStartsOn: 1 });
}

export function heatmapRange(): { from: number; to: number } {
	return {
		from: heatmapStart().getTime(),
		to: endOfDay(new Date()).getTime(),
	};
}

interface ActivityHeatmapProps {
	sessions: { startedAt: number }[];
}

export function ActivityHeatmap({ sessions }: ActivityHeatmapProps) {
	const today = startOfDay(new Date());
	const todayKey = format(today, "yyyy-MM-dd");

	const start = heatmapStart();

	const trainedSet = new Set(
		sessions.map((s) =>
			format(startOfDay(new Date(s.startedAt)), "yyyy-MM-dd"),
		),
	);

	const weeks = Array.from({ length: HEATMAP_WEEKS }, (_, w) =>
		Array.from({ length: 7 }, (_, d) => addDays(addWeeks(start, w), d)),
	);

	return (
		<div>
			<p className="mb-2 text-sm font-medium text-muted-foreground">
				Últimas {HEATMAP_WEEKS} semanas
			</p>
			<div className="flex items-start gap-1">
				<div className="flex flex-1 gap-[3px] overflow-hidden">
					{weeks.map((week) => (
						<div
							key={format(week[0], "yyyy-MM-dd")}
							className="flex flex-1 flex-col gap-[3px]"
						>
							{week.map((date) => {
								const key = format(date, "yyyy-MM-dd");
								const isFuture = isAfter(date, today);
								const isTrained = trainedSet.has(key);
								const isToday = key === todayKey;

								return (
									<div
										key={key}
										className={cn(
											"w-full rounded-[2px] aspect-square",
											isFuture && "opacity-0",
											isTrained && "bg-primary",
											isToday && "bg-muted ring-1 ring-inset ring-primary",
											!isTrained && !isToday && "bg-muted",
										)}
										title={format(date, "d MMM yyyy", { locale: ptBR })}
									/>
								);
							})}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
