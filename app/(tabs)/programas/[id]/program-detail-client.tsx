"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Pencil, Plus, Trash2, Zap, ZapOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ProgramForm } from "@/components/program-form";
import { ScheduleEditor } from "@/components/schedule-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { WorkoutExerciseData } from "@/components/workout-exercise-form";
import { WorkoutForm } from "@/components/workout-form";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function ProgramDetailClient({
	programId,
}: {
	programId: Id<"programs">;
}) {
	const router = useRouter();

	const program = useQuery(api.programs.get, { id: programId });
	const workouts = useQuery(api.workouts.listByProgram, {
		program: programId,
	});

	const activate = useMutation(api.programs.activate);
	const deactivate = useMutation(api.programs.deactivate);
	const removeProgram = useMutation(api.programs.remove);
	const removeWorkout = useMutation(api.workouts.remove);

	const [workoutFormOpen, setWorkoutFormOpen] = useState(false);
	const [editingWorkout, setEditingWorkout] = useState<{
		id: Id<"workouts">;
		name: string;
		exercises: WorkoutExerciseData[];
	} | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<{
		type: "program" | "workout";
		id: string;
		name: string;
	} | null>(null);

	if (program === undefined || workouts === undefined) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-32 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (program === null) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-4">
				<p className="text-sm text-muted-foreground">
					Programa não encontrado.
				</p>
				<Button variant="outline" onClick={() => router.push("/programas")}>
					Voltar
				</Button>
			</div>
		);
	}

	async function handleToggleActive() {
		try {
			if (program?.active) {
				await deactivate({ id: programId });
				toast.success("Programa desativado");
			} else {
				await activate({ id: programId });
				toast.success("Programa ativado");
			}
		} catch {
			toast.error("Erro ao alterar programa");
		}
	}

	async function handleDelete() {
		if (!deleteConfirm) return;

		try {
			if (deleteConfirm.type === "program") {
				await removeProgram({ id: programId });
				toast.success("Programa removido");
				router.push("/programas");
			} else {
				await removeWorkout({
					id: deleteConfirm.id as Id<"workouts">,
				});
				toast.success("Treino removido");
			}
		} catch {
			toast.error("Erro ao remover");
		} finally {
			setDeleteConfirm(null);
		}
	}

	function handleEditWorkout(workout: NonNullable<typeof workouts>[number]) {
		const exerciseData: WorkoutExerciseData[] = workout.exercises.map((e) => ({
			exerciseId: e.exercise,
			exerciseName: e.exerciseName,
			sets: e.sets,
			repsMin: e.repsMin,
			repsMax: e.repsMax,
			restMin: e.restMin,
			restMax: e.restMax,
		}));
		setEditingWorkout({
			id: workout._id,
			name: workout.name,
			exercises: exerciseData,
		});
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-start gap-3">
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={() => router.push("/programas")}
				>
					<ArrowLeft className="size-4" />
				</Button>
				<div className="flex-1 space-y-1">
					<div className="flex items-center gap-2">
						<h1 className="text-lg font-semibold tracking-tight">
							{program.name}
						</h1>
						{program.active && (
							<Badge variant="default" className="text-[10px]">
								Ativo
							</Badge>
						)}
					</div>
				</div>
				<div className="flex items-center gap-1">
					<ProgramForm
						editId={programId}
						editName={program.name}
						trigger={
							<Button variant="ghost" size="icon-sm">
								<Pencil className="size-3.5" />
							</Button>
						}
					/>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={handleToggleActive}
						title={program.active ? "Desativar" : "Ativar"}
					>
						{program.active ? (
							<ZapOff className="size-3.5" />
						) : (
							<Zap className="size-3.5" />
						)}
					</Button>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() =>
							setDeleteConfirm({
								type: "program",
								id: programId,
								name: program.name,
							})
						}
					>
						<Trash2 className="size-3.5 text-destructive" />
					</Button>
				</div>
			</div>
			<ScheduleEditor
				programId={programId}
				schedule={program.schedule}
				workouts={workouts}
			/>
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
						Treinos
					</h2>
					<Button
						variant="ghost"
						size="xs"
						onClick={() => setWorkoutFormOpen(true)}
					>
						<Plus data-icon="inline-start" />
						Novo treino
					</Button>
				</div>
				{workouts.length === 0 ? (
					<p className="py-4 text-center text-xs text-muted-foreground">
						Nenhum treino criado. Adicione treinos para configurar o cronograma.
					</p>
				) : (
					<div className="space-y-2">
						{workouts.map((workout) => (
							<Card key={workout._id} size="sm">
								<CardHeader>
									<CardTitle>{workout.name}</CardTitle>
									<CardDescription>
										{workout.exercises.length} exercício
										{workout.exercises.length !== 1 ? "s" : ""}
									</CardDescription>
									<CardAction>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon-xs"
												onClick={() => handleEditWorkout(workout)}
											>
												<Pencil className="size-3" />
											</Button>
											<Button
												variant="ghost"
												size="icon-xs"
												onClick={() =>
													setDeleteConfirm({
														type: "workout",
														id: workout._id,
														name: workout.name,
													})
												}
											>
												<Trash2 className="size-3 text-destructive" />
											</Button>
										</div>
									</CardAction>
								</CardHeader>
							</Card>
						))}
					</div>
				)}
			</div>

			<WorkoutForm
				programId={programId}
				open={workoutFormOpen}
				onOpenChange={setWorkoutFormOpen}
			/>

			{editingWorkout && (
				<WorkoutForm
					programId={programId}
					open={true}
					onOpenChange={(open) => {
						if (!open) setEditingWorkout(null);
					}}
					editId={editingWorkout.id}
					editName={editingWorkout.name}
					editExercises={editingWorkout.exercises}
				/>
			)}

			<Dialog
				open={deleteConfirm !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteConfirm(null);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirmar remoção</DialogTitle>
						<DialogDescription>
							Tem certeza que deseja remover{" "}
							<strong>{deleteConfirm?.name}</strong>?
							{deleteConfirm?.type === "program" &&
								" Todos os treinos associados também serão removidos."}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteConfirm(null)}>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							Remover
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
