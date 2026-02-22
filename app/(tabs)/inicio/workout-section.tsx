"use client";

import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { CalendarOff, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { DAY_LABELS, DAYS_OF_WEEK, type DayOfWeek } from "@/lib/constants";

function getTodayDayOfWeek(): DayOfWeek {
	const jsDay = new Date().getDay();
	return DAYS_OF_WEEK[jsDay === 0 ? 6 : jsDay - 1];
}

export function WorkoutSection() {
	const router = useRouter();
	const [pickerOpen, setPickerOpen] = useState(false);

	const activeProgram = useQuery(api.programs.getActive);
	const activeSession = useQuery(api.sessions.getActive);
	const startSession = useMutation(api.sessions.start);

	const todayWorkout = useMemo(() => {
		if (!activeProgram) return null;
		const day = getTodayDayOfWeek();
		const workoutId = activeProgram.schedule[day];
		if (!workoutId) return null;
		const workout = activeProgram.workouts.find((w: Doc<"workouts">) => w._id === workoutId);
		return workout ? { ...workout, dayLabel: DAY_LABELS[day] } : null;
	}, [activeProgram]);

	const hasOtherWorkouts =
		activeProgram !== null &&
		activeProgram !== undefined &&
		activeProgram.workouts.length > (todayWorkout ? 1 : 0);

	const handleStart = async (workoutId: Id<"workouts">) => {
		setPickerOpen(false);
		await startSession({ workout: workoutId });
		router.push("/treino-ativo");
	};

	const handleResume = () => {
		router.push("/treino-ativo");
	};

	if (activeProgram === undefined || activeSession === undefined) {
		return <Skeleton className="h-28 w-full" />;
	}

	return (
		<>
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
							.filter((w: Doc<"workouts">) => w._id !== todayWorkout?._id)
							.map((workout: Doc<"workouts">) => (
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
		</>
	);
}
