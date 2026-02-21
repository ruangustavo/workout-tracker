"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { SessionExerciseView } from "@/components/session-exercise-view";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
} from "@/components/ui/empty";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
	Dumbbell,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	ArrowUp,
	ArrowDown,
	ListOrdered,
	Check,
	SkipForward,
	Clock,
} from "lucide-react";

export default function TreinoAtivoPage() {
	const router = useRouter();
	const session = useQuery(api.sessions.getActive);
	const logs = useQuery(
		api.exerciseLogs.getBySession,
		session ? { session: session._id } : "skip",
	);
	const completeSession = useMutation(api.sessions.complete);
	const reorderLog = useMutation(api.exerciseLogs.reorder);

	const [currentLogId, setCurrentLogId] = useState<Id<"exerciseLogs"> | null>(
		null,
	);
	const [listOpen, setListOpen] = useState(false);

	// Initialize to first pending exercise when logs load
	useEffect(() => {
		if (logs && logs.length > 0 && currentLogId === null) {
			const firstPending = logs.find((l) => l.status === "pending");
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

	const currentIndex = logs.findIndex((l) => l._id === currentLogId);
	const currentLog = currentIndex >= 0 ? logs[currentIndex] : null;
	const completedCount = logs.filter(
		(l) => l.status === "completed" || l.status === "skipped",
	).length;
	const allDone = logs.every((l) => l.status !== "pending");
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
		router.push("/inicio");
	};

	const handleMoveUp = async (index: number) => {
		if (index === 0) return;
		const curr = logs[index];
		const above = logs[index - 1];
		await reorderLog({ id: curr._id, order: above.order });
		await reorderLog({ id: above._id, order: curr.order });
	};

	const handleMoveDown = async (index: number) => {
		if (index === logs.length - 1) return;
		const curr = logs[index];
		const below = logs[index + 1];
		await reorderLog({ id: curr._id, order: below.order });
		await reorderLog({ id: below._id, order: curr.order });
	};

	return (
		<div className="flex flex-col gap-4">
			{/* Header */}
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
					<Button variant="outline" size="sm" onClick={handleFinish}>
						<CheckCircle className="size-4" />
						Finalizar
					</Button>
				</div>
			</div>

			{/* Current exercise */}
			{allDone ? (
				<Empty className="flex-1 py-12">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<CheckCircle />
						</EmptyMedia>
						<EmptyTitle>Todos exercícios concluídos!</EmptyTitle>
						<EmptyDescription>
							Finalize o treino para salvar.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : currentLog ? (
				<SessionExerciseView
					key={currentLog._id}
					logId={currentLog._id}
					exerciseName={
						currentLog.exerciseDetails?.name ?? "Exercício"
					}
					config={
						workoutExercises.find(
							(e) => e.exercise === currentLog.exercise,
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
						currentLog.status !== "pending"
							? currentLog.sets
							: undefined
					}
					isCompleted={currentLog.status === "completed"}
					onCompleted={handleExerciseCompleted}
				/>
			) : null}

			{/* Prev / Next navigation */}
			{logs.length > 1 && (
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						className="flex-1"
						onClick={handlePrev}
						disabled={currentIndex <= 0}
					>
						<ChevronLeft className="size-4" />
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
						<ChevronRight className="size-4" />
					</Button>
				</div>
			)}

			{/* Exercise list + reorder sheet */}
			<Sheet open={listOpen} onOpenChange={setListOpen}>
				<SheetContent side="bottom">
					<SheetHeader>
						<SheetTitle>Exercícios</SheetTitle>
					</SheetHeader>
					<div className="space-y-1 overflow-y-auto px-4 pb-6">
						{logs.map((log, index) => (
							<div
								key={log._id}
								className="flex items-center gap-1"
							>
								<button
									type="button"
									onClick={() => {
										setCurrentLogId(log._id);
										setListOpen(false);
									}}
									className={cn(
										"flex flex-1 items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted/50",
										log._id === currentLogId &&
											"bg-muted font-medium",
									)}
								>
									<span className="size-4 shrink-0">
										{log.status === "completed" ? (
											<Check className="size-4 text-green-500" />
										) : log.status === "skipped" ? (
											<SkipForward className="size-4 text-muted-foreground" />
										) : (
											<Clock className="size-4 text-muted-foreground" />
										)}
									</span>
									<span className="flex-1 truncate">
										{log.exerciseDetails?.name ??
											"Exercício"}
									</span>
									{log.status !== "pending" && (
										<Badge
											variant="secondary"
											className="text-[10px]"
										>
											{log.status === "completed"
												? "Feito"
												: "Pulado"}
										</Badge>
									)}
								</button>
								<div className="flex flex-col">
									<Button
										variant="ghost"
										size="icon-xs"
										disabled={index === 0}
										onClick={() => handleMoveUp(index)}
									>
										<ArrowUp className="size-3" />
									</Button>
									<Button
										variant="ghost"
										size="icon-xs"
										disabled={index === logs.length - 1}
										onClick={() => handleMoveDown(index)}
									>
										<ArrowDown className="size-3" />
									</Button>
								</div>
							</div>
						))}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
