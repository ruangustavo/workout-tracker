"use client";

import { useMutation, useQuery } from "convex/react";
import {
	Check,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Clock,
	Dumbbell,
	ListOrdered,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SessionExerciseView } from "@/components/session-exercise-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type LogWithDetails = Doc<"exerciseLogs"> & { exerciseDetails: Doc<"exercises"> | null };

export function TreinoAtivoView() {
	const router = useRouter();
	const session = useQuery(api.sessions.getActive);
	const logs = useQuery(
		api.exerciseLogs.getBySession,
		session ? { session: session._id } : "skip",
	);
	const completeSession = useMutation(api.sessions.complete);

	const [currentLogId, setCurrentLogId] = useState<Id<"exerciseLogs"> | null>(
		null,
	);
	const [listOpen, setListOpen] = useState(false);

	useEffect(() => {
		if (logs && logs.length > 0 && currentLogId === null) {
			const firstPending = logs.find((l: LogWithDetails) => l.status === "pending");
			setCurrentLogId(firstPending?._id ?? logs[0]._id);
		}
	}, [logs, currentLogId]);

	if (session === undefined) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!session) {
		return (
			<Empty className="flex-1">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Dumbbell />
					</EmptyMedia>
					<EmptyTitle>Nenhum treino ativo</EmptyTitle>
					<EmptyDescription>
						Inicie um treino na tela de Início.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	if (!logs || !session.workout) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	const currentIndex = logs.findIndex((l: LogWithDetails) => l._id === currentLogId);
	const currentLog = currentIndex >= 0 ? logs[currentIndex] : null;
	const completedCount = logs.filter(
		(l: LogWithDetails) => l.status === "completed" || l.status === "skipped",
	).length;
	const allDone = logs.every((l: LogWithDetails) => l.status !== "pending");
	const workoutExercises = session.workout.exercises;

	const handlePrev = () => {
		if (currentIndex > 0) {
			setCurrentLogId(logs[currentIndex - 1]._id);
		}
	};

	const handleNext = () => {
		if (currentIndex < logs.length - 1) {
			setCurrentLogId(logs[currentIndex + 1]._id);
		}
	};

	const handleExerciseCompleted = () => {
		if (currentIndex < logs.length - 1) {
			setCurrentLogId(logs[currentIndex + 1]._id);
		}
	};

	const handleFinish = async () => {
		await completeSession({ id: session._id });
		toast.success("Treino concluído!", {
			description: session.workout?.name,
		});
		router.push("/inicio");
	};

	return (
		<div className="flex flex-col gap-4 pb-16">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-lg font-semibold tracking-tight">
						{session.workout.name}
					</h1>
					<p className="text-xs text-muted-foreground">
						{completedCount}/{logs.length} exercícios
					</p>
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => setListOpen(true)}
						title="Ver lista de exercícios"
					>
						<ListOrdered className="size-4" />
					</Button>
					<AlertDialog>
						<AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
							<CheckCircle className="size-4" />
							Finalizar
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Finalizar treino?</AlertDialogTitle>
								<AlertDialogDescription>
									O progresso será salvo e o treino encerrado.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancelar</AlertDialogCancel>
								<AlertDialogAction onClick={handleFinish}>
									Finalizar
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
			{allDone ? (
				<Empty className="flex-1 py-12">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<CheckCircle />
						</EmptyMedia>
						<EmptyTitle>Todos exercícios concluídos!</EmptyTitle>
						<EmptyDescription>Finalize o treino para salvar.</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : currentLog ? (
				<SessionExerciseView
					key={currentLog._id}
					logId={currentLog._id}
					exerciseName={currentLog.exerciseDetails?.name ?? "Exercício"}
					config={
						workoutExercises.find(
							(e: Doc<"workouts">["exercises"][number]) => e.exercise === currentLog.exercise,
						) ?? {
							exercise: currentLog.exercise,
							sets: 3,
							repsMin: 8,
							repsMax: 12,
							restMin: 60,
							restMax: 90,
						}
					}
					existingSets={
						currentLog.status !== "pending" ? currentLog.sets : undefined
					}
					isCompleted={currentLog.status === "completed"}
					onCompleted={handleExerciseCompleted}
				/>
			) : null}
			{logs.length > 1 && (
				<div className="fixed inset-x-0 bottom-16 z-30 bg-background/95 px-4 py-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
					<div className="mx-auto flex max-w-md items-center gap-2">
						<Button
							variant="outline"
							className="flex-1"
							onClick={handlePrev}
							disabled={currentIndex <= 0}
						>
							<ChevronLeft />
							Anterior
						</Button>
						<span className="text-xs text-muted-foreground tabular-nums">
							{currentIndex + 1}/{logs.length}
						</span>
						<Button
							variant="outline"
							className="flex-1"
							onClick={handleNext}
							disabled={currentIndex >= logs.length - 1}
						>
							Próximo
							<ChevronRight />
						</Button>
					</div>
				</div>
			)}
			<Sheet open={listOpen} onOpenChange={setListOpen}>
				<SheetContent side="bottom">
					<SheetHeader>
						<SheetTitle>Exercícios</SheetTitle>
					</SheetHeader>
					<div className="space-y-1 overflow-y-auto px-4 pb-6">
						{logs.map((log: LogWithDetails) => (
							<button
								key={log._id}
								type="button"
								onClick={() => {
									setCurrentLogId(log._id);
									setListOpen(false);
								}}
								className={cn(
									"flex w-full items-center gap-2 px-2 py-2 text-left text-sm hover:bg-muted/50",
									log._id === currentLogId && "bg-muted font-medium",
								)}
							>
								<span className="size-4 shrink-0">
									{log.status === "completed" ? (
										<Check className="size-4 text-green-500" />
									) : (
										<Clock className="size-4 text-muted-foreground" />
									)}
								</span>
								<span className="flex-1 truncate">
									{log.exerciseDetails?.name ?? "Exercício"}
								</span>
								{log.status === "completed" && (
									<Badge variant="secondary" className="text-[10px]">
										Feito
									</Badge>
								)}
							</button>
						))}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
