"use client";

import { useQuery } from "convex/react";
import { format, isSameMonth, startOfDay, subDays } from "date-fns";
import { Flame, Trophy } from "lucide-react";
import { useMemo } from "react";
import { ActivityHeatmap, heatmapRange } from "@/components/activity-heatmap";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";

const { from: rangeFrom, to: rangeTo } = heatmapRange();

export function MetricsSection() {
	const rangeSessions = useQuery(api.sessions.listByRange, {
		from: rangeFrom,
		to: rangeTo,
	});

	const { streak, monthSessions } = useMemo(() => {
		const today = startOfDay(new Date());
		const sessions = rangeSessions ?? [];

		const trained = new Set(
			sessions.map((s) => format(startOfDay(new Date(s.startedAt)), "yyyy-MM-dd")),
		);

		let cursor = today;
		if (!trained.has(format(cursor, "yyyy-MM-dd"))) {
			cursor = subDays(cursor, 1);
		}
		let currentStreak = 0;
		let temp = cursor;
		while (trained.has(format(temp, "yyyy-MM-dd"))) {
			currentStreak++;
			temp = subDays(temp, 1);
		}

		const monthCount = sessions.filter((s) =>
			isSameMonth(new Date(s.startedAt), today),
		).length;

		return { streak: currentStreak, monthSessions: monthCount };
	}, [rangeSessions]);

	if (rangeSessions === undefined) {
		return (
			<>
				<div className="grid grid-cols-2 gap-3">
					<Skeleton className="h-16 w-full" />
					<Skeleton className="h-16 w-full" />
				</div>
				<Skeleton className="h-24 w-full" />
			</>
		);
	}

	return (
		<>
			<div className="grid grid-cols-2 gap-3">
				<Card>
					<CardContent className="flex items-center gap-3 pt-4 pb-4">
						<Flame className="size-8 shrink-0 text-orange-500" />
						<div>
							<p className="text-2xl font-bold leading-none">{streak}</p>
							<p className="mt-1 text-xs text-muted-foreground">
								{streak === 1 ? "dia seguido" : "dias seguidos"}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-3 pt-4 pb-4">
						<Trophy className="size-8 shrink-0 text-yellow-500" />
						<div>
							<p className="text-2xl font-bold leading-none">{monthSessions}</p>
							<p className="mt-1 text-xs text-muted-foreground">
								{monthSessions === 1 ? "treino este mês" : "treinos este mês"}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<ActivityHeatmap sessions={rangeSessions} />
		</>
	);
}
