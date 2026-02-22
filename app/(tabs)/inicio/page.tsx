"use client";

import { useMutation, useQuery } from "convex/react";
import { format, isSameMonth, startOfDay, subDays } from "date-fns";
import { CalendarOff, Flame, Play, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ActivityHeatmap, heatmapRange } from "@/components/activity-heatmap";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { DAY_LABELS, DAYS_OF_WEEK, type DayOfWeek } from "@/lib/constants";

function getTodayDayOfWeek(): DayOfWeek {
	const jsDay = new Date().getDay();
	return DAYS_OF_WEEK[jsDay === 0 ? 6 : jsDay - 1];
}

export default function InicioPage() {
	const router = useRouter();
	const [pickerOpen, setPickerOpen] = useState(false);

	// Stable date range computed once on mount
	const { rangeFrom, rangeTo } = useMemo(() => {
		const { from, to } = heatmapRange();
		return { rangeFrom: from, rangeTo: to };
	}, []);

	const activeProgram = useQuery(api.programs.getActive);
	const activeSession = useQuery(api.sessions.getActive);
	const rangeSessions = useQuery(api.sessions.listByRange, {
		from: rangeFrom,
		to: rangeTo,
	});
	const startSession = useMutation(api.sessions.start);

	const todayWorkout = useMemo(() => {
		if (!activeProgram) return null;
		const day = getTodayDayOfWeek();
		const workoutId = activeProgram.schedule[day];
		if (!workoutId) return null;
		const workout = activeProgram.workouts.find((w) => w._id === workoutId);
		return workout ? { ...workout, dayLabel: DAY_LABELS[day] } : null;
	}, [activeProgram]);

	const hasOtherWorkouts =
		activeProgram !== null &&
		activeProgram !== undefined &&
		activeProgram.workouts.length > (todayWorkout ? 1 : 0);

	const { streak, monthSessions } = useMemo(() => {
		const today = startOfDay(new Date());
		const sessions = rangeSessions ?? [];

		const trained = new Set(
			sessions.map((s) => format(startOfDay(new Date(s.startedAt)), "yyyy-MM-dd")),
		);

		// Current streak: consecutive days ending today (or yesterday if today untrained)
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

		// Sessions in the current calendar month
		const monthCount = sessions.filter((s) =>
			isSameMonth(new Date(s.startedAt), today),
		).length;

		return { streak: currentStreak, monthSessions: monthCount };
	}, [rangeSessions]);

	const handleStart = async (workoutId: Id<"workouts">) => {
		setPickerOpen(false);
		await startSession({ workout: workoutId });
		router.push("/treino-ativo");
	};

	const handleResume = () => {
		router.push("/treino-ativo");
	};

	if (activeProgram === undefined) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-32" />
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-28 w-full" />
				<Skeleton className="h-24 w-full" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-lg font-semibold tracking-tight">Início</h1>

			{/* Metrics */}
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

			{/* Heatmap */}
			<ActivityHeatmap sessions={rangeSessions ?? []} />

			{/* Today's workout card */}
			{activeSession ? (
				<Card>
					<CardHeader>
						<CardTitle>{activeSession.workout?.name ?? "Treino"}</CardTitle>
						<CardDescription>
							Em andamento desde{" "}
							{format(new Date(activeSession.startedAt), "HH:mm")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button className="w-full" onClick={handleResume}>
							<Play className="size-4" />
							Continuar treino
						</Button>
					</CardContent>
				</Card>
			) : todayWorkout ? (
				<Card>
					<CardHeader>
						<CardTitle>{todayWorkout.name}</CardTitle>
						<CardDescription>Treino de {todayWorkout.dayLabel}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Button
							className="w-full"
							onClick={() => handleStart(todayWorkout._id)}
						>
							<Play className="size-4" />
							Iniciar treino
						</Button>
						{hasOtherWorkouts && (
							<Button
								variant="ghost"
								className="w-full"
								onClick={() => setPickerOpen(true)}
							>
								Escolher outro treino
							</Button>
						)}
					</CardContent>
				</Card>
			) : activeProgram ? (
				<Card>
					<CardHeader>
						<CardTitle>Dia de descanso</CardTitle>
						<CardDescription>
							Nenhum treino programado para hoje.
						</CardDescription>
					</CardHeader>
					{activeProgram.workouts.length > 0 && (
						<CardContent>
							<Button
								variant="outline"
								className="w-full"
								onClick={() => setPickerOpen(true)}
							>
								<Play className="size-4" />
								Começar um treino
							</Button>
						</CardContent>
					)}
				</Card>
			) : (
				<Empty className="py-8">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<CalendarOff />
						</EmptyMedia>
						<EmptyTitle>Nenhum programa ativo</EmptyTitle>
						<EmptyDescription>
							Ative um programa na aba Programas para começar.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}

			<Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Escolher treino</DialogTitle>
					</DialogHeader>
					<div className="space-y-2 pb-2">
						{activeProgram?.workouts
							.filter((w) => w._id !== todayWorkout?._id)
							.map((workout) => (
								<Button
									key={workout._id}
									variant="outline"
									className="w-full justify-start"
									onClick={() => handleStart(workout._id)}
								>
									{workout.name}
								</Button>
							))}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
